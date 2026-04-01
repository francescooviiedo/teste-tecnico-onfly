import { defineStore } from 'pinia';
import axios from 'axios';

export interface State {
  id: string;
  name: string;
}

export interface City {
  name: string;
  state: State;
  placeId: number;
}

export interface Hotel {
  id: number;
  name: string;
  stars: string;
  totalPrice: number;
  dailyPrice: number;
  tax: number;
  thumb: string;
  amenities: string[];
  hasBreakFast: boolean;
  hasRefundableRoom: boolean;
  district: string;
  placeId: number;
}

export interface HotelDetails {
  id: number;
  name: string;
  description: string;
  stars: string;
  amenities: { key: string; label: string }[];
  hasBreakFast: boolean;
  hasRefundableRoom: boolean;
  fullAddress: string;
  images: string[];
}

const API_BASE = 'http://localhost:3001';

export const useHotelStore = defineStore('hotel', {
  state: () => ({
    allCities: [] as City[],
    cities: [] as City[],
    hotels: [] as Hotel[],
    loading: false,
    selectedCity: null as City | null,
    selectedHotelDetails: null as HotelDetails | null,
    loadingDetails: false,

    filters: {
      name: '',
      orderBy: 'price' as 'price' | 'stars',
    },

    pagination: {
      page: 1,
      rowsPerPage: 10,
    },
  }),

  getters: {
    filteredAndSortedHotels(state): Hotel[] {
      let result = [...state.hotels];

      if (state.filters.name) {
        const search = state.filters.name.toLowerCase();
        result = result.filter((h) => h.name.toLowerCase().includes(search));
      }

      if (state.filters.orderBy === 'price') {
        result.sort((a, b) => a.totalPrice - b.totalPrice);
      } else if (state.filters.orderBy === 'stars') {
        result.sort((a, b) => Number(b.stars) - Number(a.stars));
      }

      return result;
    },

    paginatedHotels(): Hotel[] {
      const start = (this.pagination.page - 1) * this.pagination.rowsPerPage;
      const end = start + this.pagination.rowsPerPage;
      return this.filteredAndSortedHotels.slice(start, end);
    },

    totalPages(): number {
      return Math.ceil(this.filteredAndSortedHotels.length / this.pagination.rowsPerPage) || 1;
    },
  },

  actions: {
    async searchCities(query: string) {
      if (query.length < 3) {
        this.cities = [];
        return;
      }

      if (this.allCities.length === 0) {
        this.loading = true;
        try {
          const response = await axios.get<City[]>(`${API_BASE}/cities`);
          this.allCities = response.data;
        } catch (error) {
          console.error('Error fetching all cities:', error);
          return;
        } finally {
          this.loading = false;
        }
      }

      const searchTerms = query.toLowerCase();
      this.cities = this.allCities
        .filter((city) => city.name.toLowerCase().includes(searchTerms))
        .slice(0, 10);
    },

    async fetchHotelsByCity(placeId: number) {
      this.loading = true;
      try {
        const response = await axios.get<Hotel[]>(`${API_BASE}/hotels?placeId=${placeId}`);
        this.hotels = response.data;

        this.pagination.page = 1;
        this.filters.name = '';
        this.filters.orderBy = 'price';
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        this.loading = false;
      }
    },

    selectCity(city: City) {
      this.selectedCity = city;
      void this.fetchHotelsByCity(city.placeId);
    },

    async fetchHotelDetails(hotelName: string) {
      this.loadingDetails = true;
      this.selectedHotelDetails = null;
      try {
        const response = await axios.get<HotelDetails[]>(
          `${API_BASE}/hotels_details?name=${encodeURIComponent(hotelName)}`,
        );
        this.selectedHotelDetails = response.data[0] || null;
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      } finally {
        this.loadingDetails = false;
      }
    },
  },
});
