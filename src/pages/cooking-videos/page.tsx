import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cookingVideos, videoCuisineTypes } from '../../mocks/cookingVideos';
import SubmitVideoForm from './components/SubmitVideoForm';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import BackToTop from '../../components/BackToTop';

export default function CookingVideosPage() {
  const { t } = useTranslation();
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const filteredVideos = cookingVideos
    .filter(v => selectedCuisine === 'All' || v.cuisine === selectedCuisine)
    .filter(v => !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Eat Local</span>
                <span className="text-xs font-medium text-orange-500 tracking-widest uppercase">Discover · Taste · Connect</span>
              </div>
            </Link>
            <div className="flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">{t('nav.home')}</Link>
              <Link to="/restaurants" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">{t('nav.restaurants')}</Link>
              <Link to="/ingredients" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">{t('nav.ingredients')}</Link>
              <Link to="/cooking-videos" className="text-sm font-semibold text-orange-500 whitespace-nowrap cursor-pointer">{t('nav.cookingVideos')}</Link>
              <Link to="/review" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">{t('nav.reviews')}</Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative h-80 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://readdy.ai/api/search-image?query=beautiful%20overhead%20shot%20of%20diverse%20cultural%20dishes%20from%20around%20the%20world%20on%20rustic%20wooden%20table%20italian%20pasta%20mexican%20tacos%20indian%20curry%20japanese%20sushi%20warm%20natural%20lighting%20food%20photography&width=1920&height=600&seq=cooking-hero-001&orientation=landscape')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <i className="ri-youtube-fill text-red-400 text-lg"></i>
              <span className="text-white text-sm font-bold uppercase tracking-wide">{t('videos.heroBadge')}</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">{t('videos.heroHeading')}</h1>
            <p className="text-lg text-white/90 max-w-2xl">{t('videos.heroSubtext')}</p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 px-6 border-b border-gray-100 bg-white sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative w-80">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('videos.searchPlaceholder')}
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-orange-500 transition-colors text-sm"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
              {videoCuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCuisine === cuisine
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <p
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{
                __html: t('videos.found', { count: filteredVideos.length }),
              }}
            />
            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all cursor-pointer whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <i className="ri-add-circle-line text-lg"></i>
              {t('videos.submitBtn')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <a
                key={video.id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white border-2 border-gray-100 hover:border-orange-400 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg">
                      <i className="ri-play-fill text-white text-2xl ml-1"></i>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded-md">
                    {video.duration}
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-gray-900">
                    {video.cuisine}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-youtube-fill text-red-500"></i>
                      <span className="font-medium">{video.channel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <i className="ri-eye-line"></i>
                      <span>{t('videos.views', { count: video.views })}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-video-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('videos.noResults.title')}</h3>
              <p className="text-gray-500">{t('videos.noResults.desc')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-orange-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('videos.cta.heading')}</h2>
          <p className="text-gray-600 mb-8">{t('videos.cta.subtext')}</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/ingredients"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl"
            >
              <i className="ri-book-open-line text-lg"></i>
              {t('videos.cta.exploreBtn')}
            </Link>
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-restaurant-line text-lg"></i>
              {t('videos.cta.findBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-orange-50 border-t border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
            <a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              {t('footer.webDesign')}
            </a>
          </div>
        </div>
      </footer>

      {/* Submit Video Modal */}
      {showSubmitForm && (
        <SubmitVideoForm onClose={() => setShowSubmitForm(false)} />
      )}

      <BackToTop />
    </div>
  );
}
