import React, { useState, useEffect } from 'react';
import type { ProviderProfile, ServiceCategory } from '../types.ts';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Briefcase,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

interface SearchPageProps {
  initialCategory?: string;
  initialSearch?: string;
  selectedCity: string;
  selectedArea: string;
  onOpenBooking: (serviceId?: string, providerId?: string) => void;
  onOpenProviderDetail: (provider: any) => void;
}

export function SearchPage({
  initialCategory,
  initialSearch,
  selectedCity,
  selectedArea,
  onOpenBooking,
  onOpenProviderDetail,
}: SearchPageProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCat, setSelectedCat] = useState(initialCategory || 'All');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [minExp, setMinExp] = useState<number>(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_low' | 'experience'>('recommended');

  const localities = [
    'All',
    'Mansarovar',
    'Malviya Nagar',
    'Vaishali Nagar',
    'C-Scheme',
    'Raja Park',
    'Jagatpura',
    'Sanganer',
  ];

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('verificationStatus', 'APPROVED');
      if (selectedCat && selectedCat !== 'All') params.append('category', selectedCat);
      if (selectedLocality && selectedLocality !== 'All') params.append('area', selectedLocality);
      if (minRating > 0) params.append('minRating', String(minRating));
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sort', sortBy);
      if (availableOnly) params.append('availability', 'AVAILABLE');

      const res = await fetch(`/api/providers?${params.toString()}`);
      if (res.ok) {
        let data = await res.json();
        // Client-side experience filter if specified
        if (minExp > 0) {
          data = data.filter((p: any) => p.experienceYears >= minExp);
        }
        setProviders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedCat, selectedLocality, minRating, minExp, availableOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCat('All');
    setSelectedLocality('All');
    setMinRating(0);
    setMinExp(0);
    setAvailableOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white flex items-center gap-2">
            <span>Verified Experts &amp; Technicians</span>
            <span className="text-[#0df2a4] text-sm font-mono">({providers.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified &amp; background-checked professionals across {selectedCity}
          </p>
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#0df2a4] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, or service..."
            className="w-full pl-9 pr-3 py-2 bg-[#09151e] border border-teal-500/30 focus:border-[#0df2a4] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none shadow-inner"
          />
        </form>
      </div>

      {/* Category Pills Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCat('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCat === 'All'
              ? 'bg-[#0df2a4] text-slate-950 shadow-[0_0_15px_rgba(13,242,164,0.4)]'
              : 'bg-[#0a1721] hover:bg-[#102433] text-slate-300 border border-teal-500/30 hover:border-[#0df2a4]'
          }`}
        >
          All Services
        </button>
        {services.map((srv) => (
          <button
            key={srv.id}
            onClick={() => setSelectedCat(srv.name)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === srv.name
                ? 'bg-[#0df2a4] text-slate-950 shadow-[0_0_15px_rgba(13,242,164,0.4)]'
                : 'bg-[#0a1721] hover:bg-[#102433] text-slate-300 border border-teal-500/30 hover:border-[#0df2a4]'
            }`}
          >
            {srv.name}
          </button>
        ))}
      </div>

      {/* Filter and Sort Control Bar */}
      <div className="bg-[#0b1721] p-4 rounded-2xl border border-teal-500/25 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Locality filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Area:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="bg-[#061016] border border-teal-500/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#0df2a4]"
            >
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'All Localities' : loc}
                </option>
              ))}
            </select>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-[#061016] border border-teal-500/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#0df2a4]"
            >
              <option value={0}>Any Rating</option>
              <option value={4.8}>★ 4.8+ Stars</option>
              <option value={4.5}>★ 4.5+ Stars</option>
              <option value={4.0}>★ 4.0+ Stars</option>
            </select>
          </div>

          {/* Experience filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Experience:</span>
            <select
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
              className="bg-[#061016] border border-teal-500/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#0df2a4]"
            >
              <option value={0}>Any Experience</option>
              <option value={3}>3+ Years</option>
              <option value={5}>5+ Years</option>
              <option value={8}>8+ Years</option>
            </select>
          </div>

          {/* Availability Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-300 select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-teal-500/40 text-[#0df2a4] focus:ring-[#0df2a4] w-3.5 h-3.5 bg-[#061016]"
            />
            <span>Available Today</span>
          </label>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#0df2a4]" />
          <span className="text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#061016] border border-teal-500/30 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#0df2a4]"
          >
            <option value="recommended">Recommended &amp; Top Verified</option>
            <option value="rating">Highest Customer Rating</option>
            <option value="price_low">Lowest Inspection Fee</option>
            <option value="experience">Most Years of Experience</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips bar */}
      {(selectedCat !== 'All' || selectedLocality !== 'All' || minRating > 0 || minExp > 0 || availableOnly || search) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400">Active Filters:</span>
          {selectedCat !== 'All' && (
            <span className="bg-[#0b1b24] text-[#0df2a4] border border-[#0df2a4]/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              Category: {selectedCat}
              <button onClick={() => setSelectedCat('All')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedLocality !== 'All' && (
            <span className="bg-[#0b1b24] text-[#0df2a4] border border-[#0df2a4]/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              Locality: {selectedLocality}
              <button onClick={() => setSelectedLocality('All')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              ★ {minRating}+
              <button onClick={() => setMinRating(0)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="bg-[#0b1721] text-slate-200 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              &quot;{search}&quot;
              <button onClick={() => setSearch('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline ml-1"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* PROVIDER LISTING CARDS */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-[#0df2a4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Finding &amp; matching verified professionals in {selectedCity}...
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-[#0b1721] rounded-2xl border border-teal-500/30 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#07131b] border border-teal-500/30 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-[#0df2a4]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Matching Professionals Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              We could not find providers matching these exact criteria. Try resetting filters or expanding to nearby areas.
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 rounded-xl text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((prov) => (
            <div
              key={prov.userId}
              className="bg-[#0b1721] rounded-2xl border border-teal-500/25 hover:border-[#0df2a4] shadow-xl hover:shadow-[0_0_20px_rgba(13,242,164,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                {/* Header: Photo, Name, Badge, Rating */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      prov.user?.avatarUrl ||
                      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={prov.user?.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#0df2a4]/40 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3
                        onClick={() => onOpenProviderDetail(prov)}
                        className="font-bold text-white text-sm truncate hover:text-[#0df2a4] cursor-pointer"
                      >
                        {prov.user?.name}
                      </h3>
                      {prov.verificationStatus === 'APPROVED' && (
                        <span title="Govt ID &amp; Police Background Verified">
                          <ShieldCheck className="w-4 h-4 text-[#0df2a4] shrink-0" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-teal-300 font-semibold truncate mt-0.5">
                      {prov.primaryCategory} Specialist
                    </p>

                    <div className="flex items-center gap-2 text-xs mt-1.5">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{prov.ratingAvg?.toFixed(1) || '4.9'}</span>
                      </div>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">({prov.ratingCount || 42} reviews)</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{prov.completedOrdersCount || 120}+ completed</span>
                    </div>
                  </div>
                </div>

                {/* Badges strip: Experience, Location, Availability */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded-lg bg-[#07131b] border border-teal-500/20 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    <span>{prov.experienceYears} yrs experience</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-lg bg-[#07131b] border border-teal-500/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0df2a4]" />
                    <span>{prov.operatingAreas?.[0] || 'Mansarovar'}</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      prov.availability === 'AVAILABLE'
                        ? 'bg-[#0df2a4]/15 text-[#0df2a4] border-[#0df2a4]/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {prov.availability === 'AVAILABLE' ? 'Available Today' : 'On Service'}
                  </span>
                </div>

                {/* Bio teaser */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {prov.bio || 'Verified professional specializing in diagnostic, repair, and installation services with guaranteed 30-day workmanship.'}
                </p>

                {/* Sub-skills / specialized tags */}
                {prov.subCategories && prov.subCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prov.subCategories.slice(0, 3).map((sub: string, sidx: number) => (
                      <span
                        key={sidx}
                        className="text-[10px] bg-[#07131b] text-teal-300 px-2 py-0.5 rounded-md border border-teal-500/20"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Starting Price & Action Buttons */}
              <div className="p-4 bg-[#07131b]/80 border-t border-teal-900/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Inspection / Visit Fee:</span>
                  <div className="text-sm font-extrabold text-[#0df2a4] font-mono">
                    ₹{prov.hourlyRate || 299}{' '}
                    <span className="text-[10px] font-normal text-slate-400">/ visit</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenProviderDetail(prov)}
                    className="px-3 py-1.5 rounded-xl bg-[#0b1721] hover:bg-[#102433] text-slate-200 border border-teal-500/30 text-xs font-semibold transition-all"
                  >
                    Full Profile
                  </button>

                  <button
                    onClick={() => onOpenBooking(undefined, prov.userId)}
                    className="px-4 py-1.5 rounded-xl bg-[#0df2a4] hover:bg-[#00f5c4] text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(13,242,164,0.3)] transition-all flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
