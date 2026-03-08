import { useEffect, useMemo, useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cuisineTypes } from '../../../mocks/restaurants';
import { supabase } from '../../../lib/supabase';

type RestaurantRow = {
  id: string;
  name: string;
  cuisine: string | null;
};

export default function ExperienceReviewForm() {
  const { t } = useTranslation();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [justLikeHomeRating, setJustLikeHomeRating] = useState(0);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    async function fetchRestaurants() {
      setLoadingRestaurants(true);

      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine')
        .eq('approved', true)
        .eq('is_chain', false)
        .order('name', { ascending: true });

      if (error) {
        setSubmitError(error.message);
        setLoadingRestaurants(false);
        return;
      }

      setRestaurants((data || []) as RestaurantRow[]);
      setLoadingRestaurants(false);
    }

    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    if (!selectedCuisine) return restaurants;
    return restaurants.filter((r) => r.cuisine === selectedCuisine);
  }, [restaurants, selectedCuisine]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');

    if (justLikeHomeRating === 0) {
      setSubmitError('Please select a Just Like Home rating.');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const reviewer_name = formData.get('reviewer_name')?.toString().trim() || '';
    const reviewer_email = formData.get('reviewer_email')?.toString().trim() || '';
    const restaurant_id = formData.get('restaurant_id')?.toString().trim() || '';

    const country_of_origin = formData.get('country_of_origin')?.toString().trim() || '';
    const favorite_cultural_food = formData.get('favorite_cultural_food')?.toString().trim() || '';
    const familiarity_level = formData.get('familiarity_level')?.toString().trim() || '';
    const first_time_trying = formData.get('first_time_trying')?.toString().trim() || '';
    const felt_new_or_unfamiliar = formData.get('felt_new_or_unfamiliar')?.toString().trim() || '';
    const appreciated_about_food_or_tradition =
      formData.get('appreciated_about_food_or_tradition')?.toString().trim() || '';
    const one_thing_loved = formData.get('one_thing_loved')?.toString().trim() || '';
    const still_learning_to_enjoy =
      formData.get('still_learning_to_enjoy')?.toString().trim() || '';
    const favorite_type_of_cultural_food =
      formData.get('favorite_type_of_cultural_food')?.toString().trim() || '';
    const taste_like_home = formData.get('taste_like_home')?.toString().trim() || '';
    const disliked_ingredients_or_flavor =
      formData.get('disliked_ingredients_or_flavor')?.toString().trim() || '';

    if (!restaurant_id) {
      setSubmitError('Please select a restaurant.');
      return;
    }

    if (!familiarity_level) {
      setSubmitError('Please answer how familiar this cuisine is to you.');
      return;
    }

    if (!first_time_trying) {
      setSubmitError('Please answer whether this was your first time trying this cuisine.');
      return;
    }

    if (!one_thing_loved) {
      setSubmitError('Please share one thing you loved.');
      return;
    }

    if (!favorite_type_of_cultural_food) {
      setSubmitError('Please answer whether this was your favorite type of cultural food.');
      return;
    }

    if (!taste_like_home) {
      setSubmitError('Please answer whether this tasted like home cooking.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          restaurant_id,
          reviewer_name,
          reviewer_email: reviewer_email || null,
          just_like_home_rating: justLikeHomeRating,
          country_of_origin: country_of_origin || null,
          favorite_cultural_food: favorite_cultural_food || null,
          familiarity_level,
          first_time_trying,
          felt_new_or_unfamiliar: felt_new_or_unfamiliar || null,
          appreciated_about_food_or_tradition:
            appreciated_about_food_or_tradition || null,
          one_thing_loved,
          still_learning_to_enjoy: still_learning_to_enjoy || null,
          favorite_type_of_cultural_food,
          taste_like_home,
          disliked_ingredients_or_flavor: disliked_ingredients_or_flavor || null
        }
      ]);

      if (error) {
        setSubmitError(error.message);
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      form.reset();
      setJustLikeHomeRating(0);
      setSelectedCuisine('');
      setFormKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setSubmitError('Something went wrong while submitting your experience.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-heart-fill text-4xl text-teal-600"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {t('expForm.successTitle', 'Thank you for sharing your experience')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t(
            'expForm.successMsg',
            'Your cultural dining experience has been submitted successfully.'
          )}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          {t('expForm.shareAnother', 'Share Another Experience')}
        </button>
      </div>
    );
  }

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
          <i className="ri-chat-heart-line text-2xl text-teal-600"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('expForm.title', 'Share Your Experience')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('expForm.subtitle', 'Tell us about your cultural dining journey')}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
          Restaurant Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="reviewer_name"
              required
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              name="reviewer_email"
              placeholder="your@email.com (optional)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Cuisine
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer bg-white"
            >
              <option value="">All Cuisines</option>
              {cuisineTypes.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Restaurant *
            </label>
            <select
              name="restaurant_id"
              required
              disabled={loadingRestaurants}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer bg-white disabled:bg-gray-100"
            >
              <option value="">
                {loadingRestaurants ? 'Loading restaurants...' : 'Select a restaurant'}
              </option>
              {filteredRestaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.cuisine || 'Other'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country of Origin
            </label>
            <input
              type="text"
              name="country_of_origin"
              placeholder="e.g. Italy, Mexico, Japan..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Favorite Cultural Food
            </label>
            <input
              type="text"
              name="favorite_cultural_food"
              placeholder="e.g. Tacos, Sushi, Injera..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
            />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-5">
          Just Like Home Rating *
        </label>

        <div className="w-full">
          <div className="flex items-center justify-between gap-2 mb-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isActive = num === justLikeHomeRating;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setJustLikeHomeRating(num)}
                  className={`min-w-[36px] h-9 rounded-full text-sm font-bold transition-all border ${
                    isActive
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <div className="relative h-2 bg-gray-200 rounded-full mb-3">
            <div
              className="absolute top-0 left-0 h-2 bg-teal-500 rounded-full transition-all"
              style={{
                width:
                  justLikeHomeRating > 0
                    ? `${(justLikeHomeRating / 10) * 100}%`
                    : '0%'
              }}
            />
          </div>

          <div className="flex justify-between text-xs font-medium">
            <span className="text-red-500">Far From Home</span>
            <span className="text-amber-500">Half Way There</span>
            <span className="text-teal-500">Just Like Home</span>
          </div>

          {justLikeHomeRating > 0 && (
            <p className="mt-3 text-sm font-medium text-gray-600">
              Selected rating: {justLikeHomeRating}/10
            </p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-6 mb-8 border border-amber-100">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5">
          Cultural Experience Questions
        </h4>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Is this cuisine familiar to you? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'very_familiar', label: 'Very familiar' },
              { value: 'somewhat_familiar', label: 'Somewhat familiar' },
              { value: 'not_at_all', label: 'Not at all' }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 bg-white cursor-pointer"
              >
                <input type="radio" name="familiarity_level" value={option.value} />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Was this your first time trying this cuisine? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'yes_first_time', label: 'Yes, first time' },
              { value: 'no_ive_had_it_before', label: "No, I've had it before" },
              { value: 'i_grew_up_with_it', label: 'I grew up with it' }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 bg-white cursor-pointer"
              >
                <input type="radio" name="first_time_trying" value={option.value} />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What felt new or unfamiliar?
          </label>
          <textarea
            name="felt_new_or_unfamiliar"
            rows={3}
            maxLength={500}
            placeholder="Describe flavors, textures, or traditions that were new to you..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none bg-white"
          />
          <p className="mt-1 text-xs text-gray-400">Max 500 characters</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What did you appreciate about the food or tradition?
          </label>
          <textarea
            name="appreciated_about_food_or_tradition"
            rows={3}
            maxLength={500}
            placeholder="Share what stood out to you about the cultural experience..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none bg-white"
          />
          <p className="mt-1 text-xs text-gray-400">Max 500 characters</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            One thing you loved *
          </label>
          <input
            type="text"
            name="one_thing_loved"
            required
            placeholder="e.g. The handmade tortillas were incredible"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            One thing you're still learning to enjoy
          </label>
          <input
            type="text"
            name="still_learning_to_enjoy"
            placeholder="e.g. The fermented flavors were intense but interesting"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all bg-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Was this your favorite type of cultural food? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { value: 'absolutely', label: 'Absolutely!' },
              { value: 'its_up_there', label: "It's up there" },
              { value: 'not_my_top_pick', label: 'Not my top pick' },
              { value: 'still_deciding', label: 'Still deciding' }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 bg-white cursor-pointer"
              >
                <input
                  type="radio"
                  name="favorite_type_of_cultural_food"
                  value={option.value}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Did this taste like home cooking? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { value: 'yes_very_homestyle', label: 'Yes, very homestyle' },
              { value: 'somewhat', label: 'Somewhat' },
              { value: 'more_restaurant_style', label: 'More restaurant-style' },
              { value: 'cant_tell', label: "Can't tell" }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 bg-white cursor-pointer"
              >
                <input type="radio" name="taste_like_home" value={option.value} />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What ingredients did you not like or did the food lack?
          </label>
          <textarea
            name="disliked_ingredients_or_flavor"
            rows={3}
            maxLength={500}
            placeholder="e.g. I wished there was more spice, or the cilantro was overpowering for me..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none bg-white"
          />
          <p className="mt-1 text-xs text-gray-400">Max 500 characters</p>
        </div>
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || justLikeHomeRating === 0}
        className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <i className="ri-loader-4-line text-xl animate-spin"></i>
            Submitting...
          </>
        ) : (
          <>
            <i className="ri-heart-fill text-lg"></i>
            Submit Experience
          </>
        )}
      </button>
    </form>
  );
}