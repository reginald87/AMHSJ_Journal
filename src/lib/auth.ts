import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      firstName: string;
      lastName: string;
      status: string;
      image?: string | null;
      orcid?: string | null;
      affiliation?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    status: string;
    image?: string | null;
    orcid?: string | null;
    affiliation?: string | null;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    status: string;
    image?: string | null;
    orcid?: string | null;
    affiliation?: string | null;
    emailVerified?: Date | null;
  }
}

export type ExtendedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  firstName: string;
  lastName: string;
  status: string;
  image?: string | null;
  orcid?: string | null;
  affiliation?: string | null;
  emailVerified?: Date | null;
};

export type ExtendedSession = {
  user: ExtendedUser;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { params: { prompt: 'consent', access_type: 'offline', response_type: 'code' } },
          }),
        ]
      : []),
    ...(process.env.ORCID_CLIENT_ID && process.env.ORCID_CLIENT_SECRET
      ? [
          {
            id: 'orcid',
            name: 'ORCID',
            type: 'oauth' as const,
            authorization: {
              url: 'https://orcid.org/oauth/authorize',
              params: { scope: '/authenticate', show_login: 'true' },
            },
            token: { url: 'https://pub.orcid.org/oauth/token' },
            userinfo: { url: 'https://pub.orcid.org/v3.0/person', request: async (ctx: { tokens: { access_token?: string } }) => {
              const res = await fetch('https://pub.orcid.org/v3.0/person', {
                headers: { Authorization: `Bearer ${ctx.tokens.access_token}` },
              });
              return res.json();
            }},
            clientId: process.env.ORCID_CLIENT_ID,
            clientSecret: process.env.ORCID_CLIENT_SECRET,
            profile: (profile: Record<string, unknown>) => {
              const names = (profile.name ?? {}) as Record<string, unknown>;
              const given = (names['given-names'] ?? {}) as Record<string, string>;
              const family = (names['family-name'] ?? {}) as Record<string, string>;
              const emails = (profile['emails'] ?? {}) as { email?: Array<{ email: string; verified: boolean }> };
              const email = emails?.email?.[0]?.email ?? '';
              return {
                id: String(profile['put-code'] ?? ''),
                email,
                name: `${given.value ?? ''} ${family.value ?? ''}`.trim(),
                role: 'AUTHOR',
                firstName: given.value ?? '',
                lastName: family.value ?? '',
                status: 'ACTIVE',
              };
            },
          },
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        if (user.status === 'SUSPENDED') {
          throw new Error('Account suspended. Contact support.');
        }

        if (user.status === 'PENDING_VERIFICATION') {
          throw new Error('Account not verified. Please check your email.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          image: user.image ?? null,
          orcid: user.orcid ?? null,
          affiliation: user.affiliation ?? null,
          emailVerified: user.emailVerified ?? null,
        };
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'orcid' && user?.orcid && user?.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing && !existing.orcid) {
          await prisma.user.update({ where: { id: existing.id }, data: { orcid: user.orcid } });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.status = user.status;
        token.image = user.image;
        token.orcid = user.orcid;
        token.affiliation = user.affiliation;
        token.emailVerified = user.emailVerified;
      }
      if (trigger === 'update' && session) {
        if (session.user?.firstName) token.firstName = session.user.firstName;
        if (session.user?.lastName) token.lastName = session.user.lastName;
        if (session.user?.image !== undefined) token.image = session.user.image;
        if (session.user?.orcid !== undefined) token.orcid = session.user.orcid;
        if (session.user?.affiliation !== undefined) token.affiliation = session.user.affiliation;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.status = token.status;
        session.user.image = token.image;
        session.user.orcid = token.orcid;
        session.user.affiliation = token.affiliation;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};