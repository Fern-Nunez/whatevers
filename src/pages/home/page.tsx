import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { restaurants, cuisineTypes, reviews } from '../../mocks/restaurants';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import BackToTop from '../../components/BackToTop';

export default function HomePage() {
  const { t } = useTranslation();
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    window.location.href = `/map-finder?q=${encodeURIComponent(searchValue)}`;
  };

  const heroImages = [
    {
      url: 'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg',
      cuisine: 'Italian'
    },
    {
      url: 'https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg',
      cuisine: 'Mexican'
    },
    {
      url: 'https://images.pexels.com/photos/7772194/pexels-photo-7772194.jpeg',
      cuisine: 'Chinese'
    },
    {
      url: 'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg',
      cuisine: 'Thai'
    },
    {
      url: 'https://images.pexels.com/photos/3873973/pexels-photo-3873973.jpeg',
      cuisine: 'Indian'
    },
    {
      url: 'https://images.pexels.com/photos/20036115/pexels-photo-20036115.jpeg',
      cuisine: 'Lebanese'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const featuredReviews = reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-sm">
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
              <Link to="/" className="text-sm font-semibold text-orange-500 whitespace-nowrap cursor-pointer">
                {t('nav.home')}
              </Link>
              <Link
                to="/restaurants"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('nav.restaurants')}
              </Link>
              <Link
                to="/ingredients"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('nav.ingredients')}
              </Link>
              <Link
                to="/cooking-videos"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('nav.cookingVideos')}
              </Link>
              <Link
                to="/review"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer"
              >
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
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-orange-500 px-2 py-1.5 cursor-pointer"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/restaurants"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer"
              >
                {t('nav.restaurants')}
              </Link>
              <Link
                to="/ingredients"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer"
              >
                {t('nav.ingredients')}
              </Link>
              <Link
                to="/cooking-videos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer"
              >
                {t('nav.cookingVideos')}
              </Link>
              <Link
                to="/review"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer"
              >
                {t('nav.reviews')}
              </Link>
              <div className="px-2 pt-1">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${image.url}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/50"></div>
          </div>
        ))}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 left-4 md:left-8 z-20">
          <Link
            to="/map-finder"
            className="group flex items-center gap-2 md:gap-3 bg-white/95 backdrop-blur-sm rounded-full px-3 md:px-5 py-2.5 md:py-3 shadow-2xl hover:shadow-orange-200/60 hover:bg-white transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <i className="ri-map-pin-user-fill text-white text-sm md:text-base"></i>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-gray-900 whitespace-nowrap">Find Restaurants Near Me</span>
              <span className="text-[10px] text-orange-500 font-medium whitespace-nowrap flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse inline-block"></span>
                Use my location
              </span>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all duration-300">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center w-full">
          <div className="inline-block px-4 md:px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 md:mb-6">
            <p className="text-white text-xs md:text-sm font-medium tracking-wide">{t('hero.badge')}</p>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight">
            {t('hero.heading').split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h1>

          <p className="text-base md:text-xl text-white/95 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtext')}
          </p>

          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-2xl flex items-center px-4 py-3 md:px-5 md:py-4"
            >
              <i className="ri-search-line text-gray-400 text-lg mr-3"></i>

              <input
                type="text"
                placeholder="Search your area..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 outline-none text-gray-800 text-sm md:text-base bg-transparent"
              />

              <button
                type="submit"
                className="ml-3 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap max-w-3xl mx-auto">
            {cuisineTypes.slice(0, 8).map((cuisine) => (
              <button
                key={cuisine.name}
                onClick={() => setSelectedCuisine(selectedCuisine === cuisine.name ? '' : cuisine.name)}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full font-medium text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 md:gap-2 ${
                  selectedCuisine === cuisine.name
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                <span>{cuisine.flag}</span>
                <span>{cuisine.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

{/* Featured Cuisines */}
<section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-white to-orange-50/30">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-10 md:mb-16">
      <div className="inline-block px-4 py-1.5 bg-orange-100 rounded-full mb-4">
        <p className="text-orange-600 text-xs font-bold tracking-wider uppercase">
          {t('cuisines.badge')}
        </p>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
        {t('cuisines.heading')}
      </h2>
      <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
        {t('cuisines.subtext')}
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {cuisineTypes.slice(0, 8).map((cuisine) => (
        <Link
          key={cuisine.name}
          to="/restaurants"
          className="group rounded-2xl md:rounded-3xl p-6 md:p-8 min-h-[180px] md:min-h-[220px] flex flex-col items-center justify-center text-center shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          style={{ backgroundColor: `${cuisine.color}15` }}
        >
          <div className="text-4xl md:text-6xl mb-4 md:mb-5 transition-transform duration-300 group-hover:scale-110">
            {cuisine.flag}
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {cuisine.name}
          </h3>

          <p className="text-sm md:text-base text-gray-600 font-medium">
            {t('cuisines.restaurantCount', { count: cuisine.count * 24 })}
          </p>
        </Link>
      ))}
    </div>
  </div>
</section>

      {/* Map Finder Feature */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-orange-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-5 md:mb-6">
                <i className="ri-map-pin-fill text-orange-600"></i>
                <span className="text-orange-600 text-sm font-bold">{t('mapFeature.badge')}</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
                {t('mapFeature.heading')}
              </h2>

              <div className="space-y-5 md:space-y-6 mb-8 md:mb-10">
                {[
                  { icon: 'ri-navigation-line', titleKey: 'mapFeature.feature1.title', descKey: 'mapFeature.feature1.desc' },
                  { icon: 'ri-radar-line', titleKey: 'mapFeature.feature2.title', descKey: 'mapFeature.feature2.desc' },
                  { icon: 'ri-map-2-line', titleKey: 'mapFeature.feature3.title', descKey: 'mapFeature.feature3.desc' },
                ].map((f) => (
                  <div key={f.icon} className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <i className={`${f.icon} text-lg md:text-xl text-orange-600`}></i>
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{t(f.titleKey)}</h3>
                      <p className="text-sm md:text-base text-gray-600">{t(f.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/map-finder"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 border-2 border-gray-900 rounded-full font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap cursor-pointer text-sm md:text-base"
              >
                {t('mapFeature.tryMapView')}
                <i className="ri-external-link-line"></i>
              </Link>
            </div>

            <div className="relative mt-4 md:mt-0">
              <div className="absolute -top-8 -left-8 w-48 md:w-64 h-48 md:h-64 bg-orange-200/40 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-48 md:w-64 h-48 md:h-64 bg-orange-300/30 rounded-full blur-3xl"></div>
              <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-4 transform rotate-1 md:rotate-2 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://readdy.ai/api/search-image?query=modern%20mobile%20phone%20mockup%20displaying%20interactive%20restaurant%20map%20interface%20with%20location%20pins%20and%20restaurant%20list%20clean%20ui%20design%20professional%20app%20screenshot&width=800&height=1000&seq=map-mockup-001&orientation=portrait"
                  alt="Map Interface"
                  className="w-full h-auto rounded-xl md:rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Community Reviews Preview */}
<section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-teal-600 to-teal-700 text-white relative">

  <div className="max-w-7xl mx-auto relative z-10">
    <div className="text-center mb-10 md:mb-14">
      <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-4">
        <p className="text-white text-xs font-bold tracking-wider uppercase">
          {t('filterReview.badge')}
        </p>
      </div>

      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
        {t('filterReview.heading')}
      </h2>

      <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto">
        {t('filterReview.subtext')}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-8 md:mb-10">
      {featuredReviews.map((review) => {
        const restaurant = restaurants.find(r => r.id === review.restaurantId);
        const overallRating = (
          (review.authenticityScore + review.familyAtmosphere) / 2
        ).toFixed(1);

        return (
          <div
            key={review.id}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 md:p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm md:text-base">
                  {review.userName}
                </p>

                <span className="text-xs text-white/70">
                  {restaurant?.cuisine}
                </span>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <span className="text-lg md:text-xl font-bold text-white leading-none">
                  {overallRating}
                </span>

                <span className="text-[10px] text-white/70 font-medium whitespace-nowrap">
                  Overall
                </span>
              </div>
            </div>

            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
              {review.comment}
            </p>
          </div>
        );
      })}
    </div>

    <div className="text-center">
      <Link
        to="/review"
        className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-orange-50 transition-all whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl text-sm md:text-base"
      >
        <i className="ri-edit-line text-base md:text-lg"></i>
        {t('filterReview.shareExperience')}
      </Link>
    </div>
  </div>
</section>

      {/* Final CTA */}
      <section className="relative py-20 md:py-32 px-4 md:px-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/5775053/pexels-photo-5775053.jpeg')`
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            {t('cta.heading')}
          </h2>
          <p className="text-lg md:text-2xl text-white mb-3 md:mb-4">{t('cta.line1')}</p>
          <p className="text-lg md:text-2xl text-white mb-8 md:mb-12">{t('cta.line2')}</p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/map-finder"
            className="inline-flex items-center gap-0 bg-white rounded-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <i className="ri-restaurant-line text-lg text-white"></i>
            </div>

            <span className="px-4 font-semibold text-gray-900 text-sm">
              {t('cta.getStarted')}
            </span>

            <div className="pr-3">
              <i className="ri-arrow-right-up-line text-lg text-gray-900"></i>
            </div>
          </Link>

<Link
  to="/restaurants"
  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 whitespace-nowrap cursor-pointer"
>
  Browse Restaurants
  <i className="ri-arrow-right-line text-sm"></i>
</Link>
          </div>
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