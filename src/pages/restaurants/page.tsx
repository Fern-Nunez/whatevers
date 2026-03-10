import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cuisineTypes } from '../../mocks/restaurants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import BackToTop from '../../components/BackToTop';
import { supabase } from '../../lib/supabase';

type SortOption = 'popularity' | 'authenticity' | 'love';
type RegionTab = 'southern-california' | 'usa';

type RestaurantRow = {
  id: string;
  name: string;
  address: string;
  cuisine: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  is_chain: boolean | null;
  approved: boolean | null;
  image: string | null;
  review_count: number | null;
  just_like_home_rating: number | null;
  love_score: number | null;
};

type RestaurantCardData = {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  description: string;
  lat: number | null;
  lng: number | null;
  image: string;
  reviewCount: number;
  justLikeHomeRating: number;
  loveScore: number;
  popularityScore: number;
  region: string;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

export default function RestaurantsPage() {
  const { t } = useTranslation();

  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionTab, setRegionTab] = useState<RegionTab>('southern-california');
  const [selectedCounty, setSelectedCounty] = useState<string>('');

  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const counties = [
    { id: 'san-diego', name: 'San Diego', region: 'San Diego County' },
    { id: 'orange', name: 'Orange County', region: 'Orange County' },
    { id: 'los-angeles', name: 'Los Angeles County', region: 'Los Angeles County' },
    { id: 'san-bernardino', name: 'San Bernardino County', region: 'San Bernardino County' }
  ];

  function getRegionFromAddress(address: string) {
    const lower = address.toLowerCase();

    if (
      lower.includes('san diego') ||
      lower.includes('la jolla') ||
      lower.includes('chula vista') ||
      lower.includes('oceanside')
    ) {
      return 'San Diego County';
    }

    if (
      lower.includes('anaheim') ||
      lower.includes('irvine') ||
      lower.includes('santa ana') ||
      lower.includes('huntington beach') ||
      lower.includes('newport beach') ||
      lower.includes('orange county')
    ) {
      return 'Orange County';
    }

    if (
      lower.includes('los angeles') ||
      lower.includes('pasadena') ||
      lower.includes('glendale') ||
      lower.includes('long beach') ||
      lower.includes('santa monica') ||
      lower.includes('burbank') ||
      lower.includes('hollywood') ||
      lower.includes('beverly hills')
    ) {
      return 'Los Angeles County';
    }

    if (
      lower.includes('san bernardino') ||
      lower.includes('ontario') ||
      lower.includes('rancho cucamonga') ||
      lower.includes('redlands') ||
      lower.includes('rialto') ||
      lower.includes('fontana') ||
      lower.includes('upland') ||
      lower.includes('chino') ||
      lower.includes('victorville')
    ) {
      return 'San Bernardino County';
    }

    return 'USA - National';
  }

  function mapRestaurant(row: RestaurantRow): RestaurantCardData {
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      cuisine: row.cuisine || 'Other',
      description: row.description || 'Discover a great local spot.',
      lat: row.lat,
      lng: row.lng,
      image: row.image || FALLBACK_IMAGE,
      reviewCount: row.review_count ?? 0,
      justLikeHomeRating: row.just_like_home_rating ?? 0,
      loveScore: row.love_score ?? 0,
      popularityScore: row.love_score ?? row.review_count ?? 0,
      region: getRegionFromAddress(row.address)
    };
  }

  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true);
      setFetchError('');

      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          cuisine,
          description,
          lat,
          lng,
          is_chain,
          approved,
          image,
          review_count,
          just_like_home_rating,
          love_score
        `)
        .eq('approved', true)
        .eq('is_chain', false);

      if (error) {
        setFetchError(error.message);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((row) => mapRestaurant(row as RestaurantRow));
      setRestaurants(mapped);
      setLoading(false);
    }

    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        if (regionTab === 'southern-california') {
          if (selectedCounty) {
            const county = counties.find((c) => c.id === selectedCounty);
            if (county && r.region !== county.region) return false;
          } else {
            if (!counties.some((c) => c.region === r.region)) return false;
          }
        } else {
          if (r.region !== 'USA - National') return false;
        }

        if (selectedCuisine && r.cuisine !== selectedCuisine) return false;

        if (
          searchQuery &&
          !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !r.address.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popularity') return b.popularityScore - a.popularityScore;
        if (sortBy === 'authenticity') return b.justLikeHomeRating - a.justLikeHomeRating;
        if (sortBy === 'love') return b.loveScore - a.loveScore;
        return 0;
      });
  }, [restaurants, regionTab, selectedCounty, selectedCuisine, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex flex-col leading-tight">
                <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Eat Local</span>
                <span className="text-[10px] md:text-xs font-medium text-orange-500 tracking-widest uppercase">
                  Discover · Taste · Connect
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.home')}
              </Link>
              <Link to="/restaurants" className="text-sm font-semibold text-orange-500 whitespace-nowrap cursor-pointer">
                {t('nav.restaurants')}
              </Link>
              <Link to="/ingredients" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.ingredients')}
              </Link>
              <Link to="/cooking-videos" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.cookingVideos')}
              </Link>
              <Link to="/review" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.reviews')}
              </Link>
              <LanguageSwitcher />
            </div>

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i className={`text-xl text-gray-700 ${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pb-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer">
                {t('nav.home')}
              </Link>
              <Link to="/restaurants" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-orange-500 px-2 py-1.5 cursor-pointer">
                {t('nav.restaurants')}
              </Link>
              <Link to="/ingredients" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer">
                {t('nav.ingredients')}
              </Link>
              <Link to="/cooking-videos" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer">
                {t('nav.cookingVideos')}
              </Link>
              <Link to="/review" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer">
                {t('nav.reviews')}
              </Link>
              <div className="px-2 pt-1">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-3 md:mb-6">
              {t('restaurants.hero.title')}
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('restaurants.hero.subtitle')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <div className="relative">
              <i className="ri-search-line absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-xl md:text-2xl text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('restaurants.searchPlaceholder')}
                className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3.5 md:py-5 border-2 border-gray-200 rounded-2xl outline-none focus:border-orange-500 transition-colors text-sm md:text-base shadow-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-5 md:mb-6">
            <button
              onClick={() => {
                setRegionTab('southern-california');
                setSelectedCounty('');
              }}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all whitespace-nowrap cursor-pointer ${
                regionTab === 'southern-california'
                  ? 'bg-orange-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50 shadow'
              }`}
            >
              <i className="ri-map-pin-line mr-2"></i>
              Southern California
            </button>

            <button
              onClick={() => {
                setRegionTab('usa');
                setSelectedCounty('');
              }}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all whitespace-nowrap cursor-pointer ${
                regionTab === 'usa'
                  ? 'bg-orange-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50 shadow'
              }`}
            >
              <i className="ri-earth-line mr-2"></i>
              All USA
            </button>
          </div>

          {regionTab === 'southern-california' && (
            <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 flex-wrap mb-6 md:mb-8 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCounty('')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  !selectedCounty
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-teal-50 shadow'
                }`}
              >
                All Southern California
              </button>

              {counties.map((county) => (
                <button
                  key={county.id}
                  onClick={() => setSelectedCounty(county.id)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    selectedCounty === county.id
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-teal-50 shadow'
                  }`}
                >
                  {county.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-start md:justify-center gap-2 md:gap-3 flex-wrap mb-6 md:mb-8 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCuisine('')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                !selectedCuisine
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 shadow'
              }`}
            >
              {t('restaurants.allCuisines')}
            </button>

            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine.name}
                onClick={() => setSelectedCuisine(cuisine.name)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 md:gap-2 flex-shrink-0 ${
                  selectedCuisine === cuisine.name
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50 shadow'
                }`}
              >
                <span>{cuisine.flag}</span>
                <span>{cuisine.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
            <span className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">
              {t('restaurants.sortBy')}
            </span>

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  sortBy === 'popularity'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <i className="ri-fire-line mr-1"></i>
                Popularity
              </button>

              <button
                onClick={() => setSortBy('authenticity')}
                className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  sortBy === 'authenticity'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <i className="ri-shield-check-line mr-1"></i>
                Just Like Home
              </button>

              <button
                onClick={() => setSortBy('love')}
                className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  sortBy === 'love'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <i className="ri-heart-line mr-1"></i>
                Love Score
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <i className="ri-loader-4-line animate-spin text-3xl mb-3 block"></i>
              Loading restaurants...
            </div>
          ) : fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {fetchError}
            </div>
          ) : (
            <>
              <div className="mb-5 md:mb-8">
                <p className="text-base md:text-lg text-gray-600">
                  <strong className="text-gray-900 text-xl md:text-2xl">
                    {filteredRestaurants.length}
                  </strong>{' '}
                  {t('restaurants.restaurantsFound')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl md:rounded-3xl overflow-hidden hover:border-orange-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer group"
                  >
                    <div className="relative h-48 md:h-64 overflow-hidden">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="text-xs font-bold text-gray-900">{restaurant.cuisine}</span>
                      </div>

                      <div className="absolute top-3 left-3 bg-teal-600/95 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="text-xs font-bold text-white">{restaurant.region}</span>
                      </div>
                    </div>

                    <div className="p-4 md:p-6">
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2">
                        {restaurant.name}
                      </h3>

                      <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 leading-relaxed">
                        {restaurant.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex items-center gap-1">
                            <i className="ri-shield-check-fill text-teal-600 text-sm"></i>
                            <span className="text-xs md:text-sm font-semibold text-gray-900">
                              {restaurant.justLikeHomeRating > 0
                                ? restaurant.justLikeHomeRating.toFixed(1)
                                : 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <i className="ri-heart-fill text-pink-500 text-sm"></i>
                            <span className="text-xs md:text-sm font-semibold text-gray-900">
                              {restaurant.loveScore > 0
                                ? restaurant.loveScore.toFixed(1)
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs md:text-sm text-gray-500">
                          {restaurant.reviewCount} {t('restaurants.reviews')}
                        </div>
                      </div>

                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-2 text-xs md:text-sm text-gray-600">
                          <i className="ri-map-pin-line text-orange-500 mt-0.5 flex-shrink-0"></i>
                          <span className="line-clamp-2">{restaurant.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRestaurants.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  No restaurants found for those filters.
                </div>
              )}
            </>
          )}
        </div>
      </section>

<footer className="bg-gradient-to-br from-orange-900 to-orange-800 text-white">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
      <div className="col-span-2 md:col-span-1">
        <div className="flex flex-col leading-tight mb-3 md:mb-4">
          <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Eat Local</span>
          <span className="text-[10px] md:text-xs font-medium text-orange-300 tracking-widest uppercase">
            Discover · Taste · Connect
          </span>
        </div>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
          {t('footer.description')}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">
          {t('footer.explore.title')}
        </h3>
        <ul className="space-y-2 md:space-y-3">
          <li>
            <Link
              to="/map-finder"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.explore.findRestaurants')}
            </Link>
          </li>
          <li>
            <Link
              to="/restaurants"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.explore.browseCuisines')}
            </Link>
          </li>
          <li>
            <Link
              to="/ingredients"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.explore.ingredientLibrary')}
            </Link>
          </li>
          <li>
            <Link
              to="/review"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.explore.writeReview')}
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">
          {t('footer.resources.title')}
        </h3>
        <ul className="space-y-2 md:space-y-3">
          <li>
            <a
              href="#about"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.resources.aboutUs')}
            </a>
          </li>
          <li>
            <a
              href="#owners"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.resources.forOwners')}
            </a>
          </li>
          <li>
            <a
              href="#blog"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.resources.blog')}
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer"
            >
              {t('footer.resources.contact')}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">
          {t('footer.connect.title')}
        </h3>
        <div className="flex gap-3 md:gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <i className="ri-instagram-line text-lg md:text-xl"></i>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <i className="ri-facebook-fill text-lg md:text-xl"></i>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <i className="ri-twitter-x-line text-lg md:text-xl"></i>
          </a>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs md:text-sm text-gray-400">{t('footer.copyright')}</p>
      <a
        href="https://readdy.ai/?ref=logo"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        {t('footer.poweredBy')}
      </a>
    </div>
  </div>
</footer>

      <BackToTop />
    </div>
  );
}