import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ingredients } from '../../mocks/ingredients';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import BackToTop from '../../components/BackToTop';

export default function IngredientsPage() {
  const { t } = useTranslation();
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<typeof ingredients[0] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cuisines = Array.from(new Set(ingredients.map(i => i.cuisine)));

  const filteredIngredients = ingredients
    .filter(i => !selectedCuisine || i.cuisine === selectedCuisine)
    .filter(
      i =>
        !searchQuery ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
              <Link to="/restaurants" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap cursor-pointer">
                {t('nav.restaurants')}
              </Link>
              <Link to="/ingredients" className="text-sm font-semibold text-orange-500 whitespace-nowrap cursor-pointer">
                {t('nav.ingredients')}
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
                className="text-sm font-semibold text-orange-500 px-2 py-1.5 cursor-pointer"
              >
                {t('nav.ingredients')}
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

      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-200 rounded-full mb-6">
              <i className="ri-book-open-line text-amber-700"></i>
              <span className="text-amber-700 text-sm font-bold uppercase tracking-wide">
                {t('ingredients.hero.badge')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-3 md:mb-6">
              {t('ingredients.hero.title')}
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('ingredients.hero.subtitle')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <div className="relative">
              <i className="ri-search-line absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-xl md:text-2xl text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('ingredients.searchPlaceholder')}
                className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3.5 md:py-5 border-2 border-gray-200 rounded-2xl outline-none focus:border-orange-500 transition-colors text-sm md:text-base shadow-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() => setSelectedCuisine('')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
                !selectedCuisine
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {t('ingredients.allCuisines')}
            </button>
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  selectedCuisine === cuisine
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5 md:mb-8">
            <p className="text-base md:text-lg text-gray-600">
              <strong className="text-gray-900 text-xl md:text-2xl">{filteredIngredients.length}</strong>{' '}
              {t('ingredients.ingredientsFound')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {filteredIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                onClick={() => setSelectedIngredient(ingredient)}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-orange-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-gray-900">{ingredient.cuisine}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{ingredient.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ingredient.culturalOrigin}</p>
                  <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                    <span>{t('ingredients.learnMore')}</span>
                    <i className="ri-arrow-right-line"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedIngredient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
          onClick={() => setSelectedIngredient(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 md:px-8 py-5 md:py-6 flex items-center justify-between z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedIngredient.name}</h2>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-700"></i>
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="w-full h-80 bg-gray-50 rounded-2xl overflow-hidden">
                  <img
                    src={selectedIngredient.image}
                    alt={selectedIngredient.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                      {selectedIngredient.cuisine}
                    </span>
                    <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold">
                      {selectedIngredient.culturalOrigin}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('ingredients.modal.description')}</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedIngredient.description}</p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t('ingredients.modal.traditionalUses')}</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedIngredient.traditionalUses.map((use) => (
                      <span key={use} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-orange-500"></i>
                    {t('ingredients.modal.preparationTips')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedIngredient.preparationTips}</p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-store-line text-orange-500"></i>
                    {t('ingredients.modal.whereToFind')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedIngredient.whereToFind}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-exchange-line text-orange-500"></i>
                    {t('ingredients.modal.substitutes')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedIngredient.substitutes}</p>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-heart-pulse-line text-orange-500"></i>
                    {t('ingredients.modal.nutritionalInfo')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedIngredient.nutritionalInfo}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="ri-ancient-gate-line text-teal-600"></i>
                  {t('ingredients.modal.culturalSignificance')}
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedIngredient.culturalSignificance}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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