import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RestaurantSubmitForm from './components/RestaurantSubmitForm';
import ExperienceReviewForm from './components/ExperienceReviewForm';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import BackToTop from '../../components/BackToTop';

type Tab = 'restaurant' | 'experience';

export default function ReviewPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('experience');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
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
              <Link to="/restaurants" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.restaurants')}
              </Link>
              <Link to="/ingredients" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.ingredients')}
              </Link>
              <Link to="/cooking-videos" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.cookingVideos')}
              </Link>
              <Link to="/review" className="text-sm font-semibold text-orange-500 whitespace-nowrap cursor-pointer">
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
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500 cursor-pointer"
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
                className="text-sm font-semibold text-orange-500 px-2 py-1.5 cursor-pointer"
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

      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 px-4 md:px-6">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=warm%20overhead%20view%20of%20diverse%20cultural%20dishes%20on%20rustic%20wooden%20table%20sharing%20food%20community%20gathering%20authentic%20home%20cooked%20meals%20warm%20natural%20lighting%20soft%20focus%20background&width=1920&height=600&seq=review-hero-001&orientation=landscape')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-white"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center pt-10 md:pt-12 pb-6 md:pb-8">
          <div className="inline-block px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-5">
            <p className="text-white text-sm font-medium tracking-wide">{t('review.hero.badge')}</p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t('review.hero.title')}
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto">
            {t('review.hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="px-4 md:px-6 -mt-4 relative z-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex-1 py-3 px-4 md:px-6 rounded-full font-semibold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'experience'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-chat-heart-line text-lg"></i>
              {t('review.tabs.shareExperience')}
            </button>
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`flex-1 py-3 px-4 md:px-6 rounded-full font-semibold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'restaurant'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-store-2-line text-lg"></i>
              {t('review.tabs.submitRestaurant')}
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 py-10 md:py-12">
        <div className="max-w-3xl mx-auto">
          {activeTab === 'experience' ? <ExperienceReviewForm /> : <RestaurantSubmitForm />}
        </div>
      </section>

      <section className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{t('review.whyShare.title')}</h2>
            <p className="text-gray-600">{t('review.whyShare.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: 'ri-community-line',
                title: t('review.whyShare.cards.buildCommunity.title'),
                desc: t('review.whyShare.cards.buildCommunity.description'),
                color: 'bg-orange-100 text-orange-600'
              },
              {
                icon: 'ri-shield-star-line',
                title: t('review.whyShare.cards.preserveTraditions.title'),
                desc: t('review.whyShare.cards.preserveTraditions.description'),
                color: 'bg-teal-100 text-teal-600'
              },
              {
                icon: 'ri-store-3-line',
                title: t('review.whyShare.cards.supportLocal.title'),
                desc: t('review.whyShare.cards.supportLocal.description'),
                color: 'bg-amber-100 text-amber-600'
              }
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-5`}>
                  <i className={`${item.icon} text-2xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">{t('footer.explore.title')}</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><Link to="/map-finder" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.explore.findRestaurants')}</Link></li>
                <li><Link to="/restaurants" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.explore.browseCuisines')}</Link></li>
                <li><Link to="/ingredients" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.explore.ingredientLibrary')}</Link></li>
                <li><Link to="/review" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.explore.writeReview')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">{t('footer.resources.title')}</h3>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="#about" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.resources.aboutUs')}</a></li>
                <li><a href="#owners" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.resources.forOwners')}</a></li>
                <li><a href="#blog" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.resources.blog')}</a></li>
                <li><a href="#contact" className="text-sm md:text-base text-white hover:text-orange-400 transition-colors cursor-pointer">{t('footer.resources.contact')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 md:mb-4">{t('footer.connect.title')}</h3>
              <div className="flex gap-3 md:gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer nofollow" className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <i className="ri-instagram-line text-lg md:text-xl"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer nofollow" className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <i className="ri-facebook-fill text-lg md:text-xl"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer nofollow" className="w-9 h-9 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <i className="ri-twitter-x-line text-lg md:text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs md:text-sm text-gray-400">{t('footer.copyright')}</p>
            <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
              {t('footer.poweredBy')}
            </a>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}