import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { createClient } from "@supabase/supabase-js";
import LanguageSwitcher from "../../components/LanguageSwitcher";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

type Restaurant = {
  id: string | number;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  cuisine: string | null;
  description: string | null;
  image: string | null;
  is_chain?: boolean | null;
  just_like_home_rating?: number | null;
  love_score?: number | null;
};

type RestaurantWithDistance = Restaurant & {
  distance: number;
};

type SortOption = "distance" | "name";

const NEARBY_RADIUS_MILES = 50;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

mapboxgl.accessToken = MAPBOX_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function escapeHtml(input: string) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function MapFinderPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const selectedRestaurantRef = useRef<string | number | null>(null);

  const [loading, setLoading] = useState(false);
  const [pinsCount, setPinsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [listLimit, setListLimit] = useState(50);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const [allResults, setAllResults] = useState<RestaurantWithDistance[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const cuisineTypes = useMemo(() => {
    return Array.from(new Set(allResults.map((r) => r.cuisine).filter(Boolean))).sort() as string[];
  }, [allResults]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  const openPopupForRestaurant = useCallback(
    (restaurantId: string | number, source: RestaurantWithDistance[]) => {
      if (!mapRef.current) return;

      const restaurant = source.find((r) => r.id === restaurantId);
      if (!restaurant) return;

      const marker = markersRef.current.find((m: any) => {
        const lngLat = m.getLngLat();
        return lngLat.lng === restaurant.lng && lngLat.lat === restaurant.lat;
      });

      if (marker) {
        marker.getPopup().addTo(mapRef.current);
      }
    },
    []
  );

  const flyToPlace = useCallback((place: RestaurantWithDistance) => {
    if (!mapRef.current) return;

    selectedRestaurantRef.current = place.id;

    mapRef.current.flyTo({
      center: [place.lng, place.lat],
      zoom: 15,
      speed: 1.4,
    });
  }, []);

  const fetchNearbyAndPins = useCallback(async () => {
    if (!mapRef.current) return;

    setLoading(true);

    const center = mapRef.current.getCenter();
    const lat0 = center.lat;
    const lng0 = center.lng;

    const miles = 10;
    const latDelta = miles / 69;
    const lngDelta = miles / (69 * Math.cos((lat0 * Math.PI) / 180));

    const south = lat0 - latDelta;
    const north = lat0 + latDelta;
    const west = lng0 - lngDelta;
    const east = lng0 + lngDelta;

    const { data, error } = await supabase
      .from("restaurants")
      .select(
        "id,name,address,lat,lng,cuisine,description,image,is_chain,approved,just_like_home_rating,love_score"
      )
      .gte("lat", south)
      .lte("lat", north)
      .gte("lng", west)
      .lte("lng", east)
      .eq("is_chain", false)
      .eq("approved", true)
      .limit(1500);

    if (error) {
      console.error("Supabase error:", error);
      setLoading(false);
      return;
    }

    const ranked: RestaurantWithDistance[] = (data || [])
      .map((r: any) => ({
        ...r,
        lat: Number(r.lat),
        lng: Number(r.lng),
        image: r.image || null,
        just_like_home_rating: r.just_like_home_rating ?? null,
        love_score: r.love_score ?? null,
      }))
      .filter((r: Restaurant) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
      .map((r: Restaurant) => ({
        ...r,
        distance: haversineMiles(lat0, lng0, r.lat, r.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    setAllResults(ranked);

    const pinResults = ranked.slice(0, 10);
    setPinsCount(pinResults.length);

    clearMarkers();

    pinResults.forEach((r) => {
      const popupHtml = `
        <div style="width:260px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="overflow:hidden;border-radius:16px;background:#fff;">
            <img
              src="${escapeHtml(r.image || FALLBACK_IMAGE)}"
              alt="${escapeHtml(r.name || "")}"
              style="width:100%;height:150px;object-fit:cover;display:block;"
              onerror="this.src='${FALLBACK_IMAGE}'"
            />

            <div style="padding:14px 14px 12px 14px;">
              <div style="font-size:24px;font-weight:800;line-height:1.15;color:#111827;margin-bottom:6px;">
                ${escapeHtml(r.name || "")}
              </div>

              ${
                r.cuisine
                  ? `<div style="font-size:14px;font-weight:700;color:#f97316;margin-bottom:8px;">
                       ${escapeHtml(r.cuisine)}
                     </div>`
                  : ""
              }

              ${
                r.address
                  ? `<div style="font-size:14px;color:#374151;line-height:1.45;margin-bottom:4px;">
                       ${escapeHtml(r.address)}
                     </div>`
                  : ""
              }

              <div style="font-size:14px;color:#6b7280;margin-bottom:10px;">
                ${Number.isFinite(r.distance) ? `${r.distance.toFixed(2)} mi away` : ""}
              </div>

              ${
                r.description
                  ? `<div style="font-size:14px;color:#374151;line-height:1.5;">
                       ${escapeHtml(r.description)}
                     </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;

      const markerEl = document.createElement("div");
      markerEl.className = "w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md";

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([r.lng, r.lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(popupHtml))
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    if (selectedRestaurantRef.current != null) {
      openPopupForRestaurant(selectedRestaurantRef.current, pinResults);
    }

    setLoading(false);
  }, [clearMarkers, openPopupForRestaurant]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");

    if (!q || !mapReady || !geocoderRef.current) return;

    geocoderRef.current.query(q);

    setTimeout(() => {
      setSearchQuery("");
      fetchNearbyAndPins();
    }, 600);
  }, [location.search, mapReady, fetchNearbyAndPins]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-117.2898, 34.1083],
      zoom: 11,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    geocoderRef.current = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl,
      marker: true,
      zoom: 13,
      placeholder: "Enter your address or city...",
    });

    if (geocoderContainerRef.current && geocoderRef.current) {
      geocoderContainerRef.current.innerHTML = "";
      geocoderContainerRef.current.appendChild(geocoderRef.current.onAdd(mapRef.current));
    }

    setMapReady(true);

    geocoderRef.current.on("result", async () => {
      setSearchQuery("");
      await fetchNearbyAndPins();
    });

    mapRef.current.on("moveend", async () => {
      await fetchNearbyAndPins();
    });

    mapRef.current.on("click", () => {
      selectedRestaurantRef.current = null;
    });

    mapRef.current.on("dragstart", () => {
      selectedRestaurantRef.current = null;
    });

    fetchNearbyAndPins();

    return () => {
      try {
        clearMarkers();

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
        }

        if (geocoderRef.current) geocoderRef.current.clear();
        if (mapRef.current) mapRef.current.remove();
      } catch (error) {
        console.error(error);
      }

      mapRef.current = null;
    };
  }, [fetchNearbyAndPins, clearMarkers]);

  useEffect(() => {
    if (!mapRef.current) return;
    fetchNearbyAndPins();
  }, [listLimit, fetchNearbyAndPins]);

  const handleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setLocError(null);
      selectedRestaurantRef.current = null;

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      return;
    }

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setUserLocation(loc);
        setNearMeActive(true);
        setSortBy("distance");
        setLocating(false);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [loc.lng, loc.lat],
            zoom: 13,
            speed: 1.4,
          });
        }

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userEl = document.createElement("div");
        userEl.className = "w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-lg";

        userMarkerRef.current = new mapboxgl.Marker(userEl)
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new mapboxgl.Popup({ offset: 16 }).setText("Your location"))
          .addTo(mapRef.current!);

        await fetchNearbyAndPins();
      },
      () => {
        setLocError("Unable to detect your location. Please allow location access.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const filteredRestaurants = useMemo(() => {
    let results = [...allResults];

    if (selectedCuisine) {
      results = results.filter((r) => r.cuisine === selectedCuisine);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.address?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }

    if (nearMeActive && userLocation) {
      results = results.filter(
        (r) =>
          haversineMiles(userLocation.lat, userLocation.lng, r.lat, r.lng) <=
          NEARBY_RADIUS_MILES
      );
    }

    if (sortBy === "distance") {
      results.sort((a, b) => a.distance - b.distance);
    }

    if (sortBy === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results.slice(0, listLimit);
  }, [allResults, selectedCuisine, searchQuery, nearMeActive, userLocation, sortBy, listLimit]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="w-full px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex flex-col leading-tight">
                <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Eat Local</span>
                <span className="text-[10px] md:text-xs font-medium text-orange-500 tracking-widest uppercase">
                  Discover · Taste · Connect
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/restaurants"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                {t("nav.restaurants")}
              </Link>
              <Link
                to="/ingredients"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                {t("nav.ingredients")}
              </Link>
              <Link
                to="/cooking-videos"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                {t("nav.cookingVideos")}
              </Link>
              <Link
                to="/review"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                {t("nav.reviews")}
              </Link>
              <LanguageSwitcher />
            </div>

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i
                className={`text-xl text-gray-700 ${
                  mobileMenuOpen ? "ri-close-line" : "ri-menu-line"
                }`}
              ></i>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500"
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/restaurants"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500"
              >
                {t("nav.restaurants")}
              </Link>
              <Link
                to="/ingredients"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500"
              >
                {t("nav.ingredients")}
              </Link>
              <Link
                to="/cooking-videos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500"
              >
                {t("nav.cookingVideos")}
              </Link>
              <Link
                to="/review"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-700 px-2 py-1.5 hover:text-orange-500"
              >
                {t("nav.reviews")}
              </Link>
              <div className="px-2 pt-1">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-20 md:h-screen flex flex-col md:flex-row">
        <div className="order-1 md:order-2 w-full md:flex-1 relative h-[38vh] md:h-auto">
          <div ref={mapContainerRef} className="w-full h-full" />

          <div className="hidden md:block absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl p-4 max-w-xs">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-map-pin-fill text-orange-500"></i>
              {t("mapFinder.legend.title")}
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Nearby restaurant pin</span>
              </div>

              {nearMeActive && (
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-1">
                  <div className="w-3 h-3 bg-orange-400 rounded-full ring-2 ring-orange-200"></div>
                  <span className="text-orange-600 font-medium">
                    Within {NEARBY_RADIUS_MILES} mi of you
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-2 md:order-1 w-full md:w-2/5 bg-white border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="mb-4 sticky top-0 bg-white z-10 pt-1 pb-2">
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                <div ref={geocoderContainerRef} className="mapbox-geocoder-wrapper" />
              </div>
            </div>

            <div className="mb-5">
              <button
                onClick={handleNearMe}
                disabled={locating}
                className={`w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-300 border-2 ${
                  nearMeActive
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200"
                    : "bg-white border-orange-400 text-orange-500 hover:bg-orange-50"
                } ${locating ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {locating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base"></i>
                    Detecting your location…
                  </>
                ) : nearMeActive ? (
                  <>
                    <i className="ri-map-pin-user-fill text-base"></i>
                    Near Me — Active
                    <span className="ml-auto text-xs bg-white/30 px-2 py-0.5 rounded-full">
                      {filteredRestaurants.length} nearby
                    </span>
                  </>
                ) : (
                  <>
                    <i className="ri-map-pin-user-line text-base"></i>
                    Near Me
                    <span className="ml-1 text-xs text-orange-400">
                      within {NEARBY_RADIUS_MILES} mi
                    </span>
                  </>
                )}
              </button>

              {locError && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <i className="ri-error-warning-line mt-0.5"></i>
                  {locError}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                {t("mapFinder.filterByCuisine")}
              </h3>

              <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
                <button
                  onClick={() => setSelectedCuisine("")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    !selectedCuisine
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("mapFinder.allCuisines")}
                </button>

                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCuisine === cuisine
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                {t("mapFinder.sortBy")}
              </h3>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  onClick={() => setSortBy("distance")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "distance"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <i className="ri-map-pin-line mr-1"></i>
                  {t("mapFinder.sort.distance")}
                </button>

                <button
                  onClick={() => setSortBy("name")}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === "name"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <i className="ri-sort-alphabet-asc mr-1"></i>
                  Name
                </button>
              </div>

              <label className="text-xs text-gray-500">
                List size
                <select
                  value={listLimit}
                  onChange={(e) => setListLimit(Number(e.target.value))}
                  className="ml-2 px-2 py-1 border border-gray-200 rounded-md"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-900">{filteredRestaurants.length}</strong> restaurants
                found
                <span className="ml-2 text-xs text-gray-400">
                  {loading ? "Loading…" : `Pins: ${pinsCount}`}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              {filteredRestaurants.map((restaurant) => {
                const isNearby =
                  nearMeActive &&
                  userLocation &&
                  haversineMiles(userLocation.lat, userLocation.lng, restaurant.lat, restaurant.lng) <=
                    NEARBY_RADIUS_MILES;

                return (
                  <div
                    key={restaurant.id}
                    onClick={() => flyToPlace(restaurant)}
                    className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-orange-500 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 bg-gray-100">
                        <img
                          src={restaurant.image || FALLBACK_IMAGE}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>

                      <div className="p-3 sm:p-4 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                            {restaurant.name}
                          </h3>

                          {restaurant.cuisine && (
                            <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">
                              {restaurant.cuisine}
                            </span>
                          )}
                        </div>

                        {restaurant.address && (
                          <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                            <i className="ri-map-pin-line"></i>
                            {restaurant.address}
                          </p>
                        )}

                        {restaurant.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {restaurant.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                          <div className="flex items-center gap-1 text-orange-500 font-semibold">
                            <i className="ri-route-line text-xs"></i>
                            {restaurant.distance < 1
                              ? `${(restaurant.distance * 5280).toFixed(0)} ft`
                              : `${restaurant.distance.toFixed(1)} mi`}
                          </div>

                          <div className="flex items-center gap-1 text-teal-600 font-semibold">
                            <i className="ri-shield-check-fill text-sm"></i>
                            {restaurant.just_like_home_rating && restaurant.just_like_home_rating > 0
                              ? restaurant.just_like_home_rating.toFixed(1)
                              : "N/A"}
                          </div>

                          <div className="flex items-center gap-1 text-pink-500 font-semibold">
                            <i className="ri-heart-fill text-sm"></i>
                            {restaurant.love_score && restaurant.love_score > 0
                              ? restaurant.love_score.toFixed(1)
                              : "N/A"}
                          </div>

                          {isNearby && (
                            <div className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white shadow-sm whitespace-nowrap">
                              NEARBY
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredRestaurants.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-100 rounded-full">
                    <i className="ri-search-line text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-500 font-medium mb-1">No restaurants found</p>
                  <p className="text-gray-400 text-sm">Try changing the filters or moving the map</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}