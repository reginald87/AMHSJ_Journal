'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Stat { value: string; label: string; }
interface Feature { title: string; description: string; icon: string; }
interface Indexer { name: string; color: string; }
interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hero, setHero] = useState({ badge: '', title: '', subtitle: '', issn: '', impactFactor: '' });
  const [stats, setStats] = useState<Stat[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [indexers, setIndexers] = useState<Indexer[]>([]);
  const [carousel, setCarousel] = useState<CarouselSlide[]>([]);
  const [cta, setCta] = useState({ heading: '', text: '' });

  useEffect(() => {
    fetch('/api/admin/homepage')
      .then(r => r.json())
      .then(data => {
        setHero({ badge: data.heroBadge || '', title: data.heroTitle || '', subtitle: data.heroSubtitle || '', issn: data.heroISSN || '', impactFactor: data.heroImpactFactor || '' });
        setStats(data.homepageStats || []);
        setFeatures(data.homepageFeatures || []);
        setIndexers(data.homepageIndexers || []);
        setCarousel(data.heroCarousel || []);
        setCta({ heading: data.homepageCtaHeading || '', text: data.homepageCtaText || '' });
      })
      .catch(() => toast.error('Failed to load homepage settings'))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBadge: hero.badge,
          heroTitle: hero.title,
          heroSubtitle: hero.subtitle,
          heroISSN: hero.issn,
          heroImpactFactor: hero.impactFactor,
          homepageStats: stats,
          homepageFeatures: features,
          homepageIndexers: indexers,
          homepageCtaHeading: cta.heading,
          homepageCtaText: cta.text,
          heroCarousel: carousel,
        }),
      });
      if (res.ok) toast.success('Homepage settings saved');
      else toast.error('Failed to save');
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  const addStat = () => setStats([...stats, { value: '', label: '' }]);
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));
  const updateStat = (i: number, field: keyof Stat, val: string) => {
    const next = [...stats];
    next[i] = { ...next[i], [field]: val };
    setStats(next);
  };

  const addFeature = () => setFeatures([...features, { title: '', description: '', icon: 'Search' }]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, field: keyof Feature, val: string) => {
    const next = [...features];
    next[i] = { ...next[i], [field]: val };
    setFeatures(next);
  };

  const addIndexer = () => setIndexers([...indexers, { name: '', color: 'bg-slate-600' }]);
  const removeIndexer = (i: number) => setIndexers(indexers.filter((_, idx) => idx !== i));
  const updateIndexer = (i: number, field: keyof Indexer, val: string) => {
    const next = [...indexers];
    next[i] = { ...next[i], [field]: val };
    setIndexers(next);
  };

  const addSlide = () => setCarousel([...carousel, { id: Date.now(), image: '', title: '', subtitle: '', ctaText: '', ctaHref: '' }]);
  const removeSlide = (i: number) => setCarousel(carousel.filter((_, idx) => idx !== i));
  const updateSlide = (i: number, field: keyof CarouselSlide, val: string) => {
    const next = [...carousel];
    next[i] = { ...next[i], [field]: val };
    setCarousel(next);
  };

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">Homepage Content</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage the content displayed on the journal homepage</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Badge Text" value={hero.badge} onChange={e => setHero({...hero, badge: e.target.value})} placeholder="Now Accepting Submissions for 2025 Issues" />
            <Input label="Title" value={hero.title} onChange={e => setHero({...hero, title: e.target.value})} placeholder="Advances in Medicine and Health Sciences Journal" />
            <Textarea label="Subtitle" value={hero.subtitle} onChange={e => setHero({...hero, subtitle: e.target.value})} rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="ISSN Display" value={hero.issn} onChange={e => setHero({...hero, issn: e.target.value})} placeholder="2XXX-XXXX (Print) | 2XXX-XXXX (Online)" />
              <Input label="Impact Factor" value={hero.impactFactor} onChange={e => setHero({...hero, impactFactor: e.target.value})} placeholder="2.5 (2024)" />
            </div>
          </CardContent>
        </Card>

        {/* Hero Carousel Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hero Carousel</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSlide}><Plus className="w-4 h-4 mr-1" /> Add Slide</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {carousel.length === 0 && <p className="text-sm text-slate-500">No slides added yet.</p>}
            {carousel.map((slide, i) => (
              <div key={slide.id} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:grabbing"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Slide #{i + 1}</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSlide(i)} className="text-red-600 hover:text-red-700 h-8 w-8 ml-auto">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <ImageUpload
                  label="Slide Image"
                  value={slide.image}
                  onChange={(url) => updateSlide(i, 'image', url)}
                  folder="carousel"
                />
                <Input label="Title" value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)} />
                <Textarea label="Subtitle" value={slide.subtitle} onChange={e => updateSlide(i, 'subtitle', e.target.value)} rows={2} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="CTA Text" value={slide.ctaText} onChange={e => updateSlide(i, 'ctaText', e.target.value)} placeholder="Submit Your Manuscript" />
                  <Input label="CTA Link" value={slide.ctaHref} onChange={e => updateSlide(i, 'ctaHref', e.target.value)} placeholder="/submit" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stats Bar</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addStat}><Plus className="w-4 h-4 mr-1" /> Add Stat</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.length === 0 && <p className="text-sm text-slate-500">No stats added yet.</p>}
            {stats.map((stat, i) => (
              <div key={i} className="flex gap-3 items-end">
                <Input label="Value" value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="500+" className="flex-1" />
                <Input label="Label" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Published Articles" className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(i)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Features / Why Publish</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}><Plus className="w-4 h-4 mr-1" /> Add Feature</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.length === 0 && <p className="text-sm text-slate-500">No features added yet.</p>}
            {features.map((feature, i) => (
              <div key={i} className="border border-slate-200 dark:border-navy-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Input label="Title" value={feature.title} onChange={e => updateFeature(i, 'title', e.target.value)} className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(i)} className="text-red-600 ml-2"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <Textarea label="Description" value={feature.description} onChange={e => updateFeature(i, 'description', e.target.value)} rows={2} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Indexers Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Indexing & Metrics</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addIndexer}><Plus className="w-4 h-4 mr-1" /> Add Indexer</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {indexers.length === 0 && <p className="text-sm text-slate-500">No indexers added yet.</p>}
            {indexers.map((indexer, i) => (
              <div key={i} className="flex gap-3 items-end">
                <Input label="Name" value={indexer.name} onChange={e => updateIndexer(i, 'name', e.target.value)} placeholder="PubMed" className="flex-1" />
                <Input label="Color Class" value={indexer.color} onChange={e => updateIndexer(i, 'color', e.target.value)} placeholder="bg-blue-600" className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeIndexer(i)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card>
          <CardHeader><CardTitle>Call to Action</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Heading" value={cta.heading} onChange={e => setCta({...cta, heading: e.target.value})} placeholder="Submit Your Manuscript Today" />
            <Textarea label="Text" value={cta.text} onChange={e => setCta({...cta, text: e.target.value})} rows={2} placeholder="Join thousands of researchers..." />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-navy-800">
          <Button type="submit" loading={loading} size="lg">Save Homepage Settings</Button>
        </div>
      </form>
    </div>
  );
}