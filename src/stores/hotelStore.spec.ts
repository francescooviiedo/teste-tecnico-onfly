/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHotelStore, type Hotel, type City } from './hotelStore';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Store de Hotéis', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Ações', () => {
    it('não deve buscar cidades se a consulta tiver menos de 3 caracteres', async () => {
      const store = useHotelStore();
      await store.searchCities('be');
      expect(store.cities).toEqual([]);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('deve buscar todas as cidades e filtrar localmente se a consulta tiver 3 ou mais caracteres', async () => {
      const store = useHotelStore();
      const mockCities: City[] = [
        { name: 'Belo Horizonte', state: { id: 'MG', name: 'Minas Gerais' }, placeId: 1 },
        { name: 'São Paulo', state: { id: 'SP', name: 'São Paulo' }, placeId: 2 }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockCities });

      await store.searchCities('bel');

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/cities'));
      expect(store.cities).toEqual([mockCities[0]]);
      expect(store.allCities).toEqual(mockCities);
    });

    it('deve lidar com erro ao buscar cidades', async () => {
      const store = useHotelStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await store.searchCities('bel');

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching all cities:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('deve buscar hotéis pelo placeId da cidade', async () => {
      const store = useHotelStore();
      const mockHotels = [{ id: 1, name: 'Hotel 1', placeId: 1, totalPrice: 100, stars: '4' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockHotels });

      await store.fetchHotelsByCity(1);

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('hotels?placeId=1'));
      expect(store.hotels).toEqual(mockHotels);
      expect(store.pagination.page).toBe(1);
    });

    it('deve lidar com erro ao buscar hotéis', async () => {
      const store = useHotelStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await store.fetchHotelsByCity(1);

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching hotels:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('deve selecionar uma cidade e buscar seus hotéis', () => {
      const store = useHotelStore();
      const city: City = { name: 'Belo Horizonte', state: { id: 'MG', name: 'Minas Gerais' }, placeId: 1 };
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      store.selectCity(city);

      expect(store.selectedCity).toEqual(city);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('hotels?placeId=1'));
    });

    it('deve buscar os detalhes do hotel pelo nome', async () => {
      const store = useHotelStore();
      const mockDetails = [{ id: 1, name: 'Hotel 1', description: 'Desc' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockDetails });

      await store.fetchHotelDetails('Hotel 1');

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('hotels_details?name=Hotel%201'));
      expect(store.selectedHotelDetails).toEqual(mockDetails[0]);
    });

    it('deve lidar com erro ao buscar detalhes do hotel', async () => {
      const store = useHotelStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await store.fetchHotelDetails('Hotel 1');

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching hotel details:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Getters', () => {
    it('deve filtrar hotéis pelo nome', () => {
      const store = useHotelStore();
      const hotels: Partial<Hotel>[] = [
        { id: 1, name: 'Hotel Alpha', stars: '3', totalPrice: 100 },
        { id: 2, name: 'Hotel Beta', stars: '4', totalPrice: 200 },
      ];
      store.hotels = hotels as Hotel[];
      store.filters.name = 'Alpha';

      expect(store.filteredAndSortedHotels).toHaveLength(1);
      expect(store.filteredAndSortedHotels[0]?.name).toBe('Hotel Alpha');
    });

    it('deve ordenar hotéis pelo preço', () => {
      const store = useHotelStore();
      const hotels: Partial<Hotel>[] = [
        { id: 1, totalPrice: 200 },
        { id: 2, totalPrice: 100 },
      ];
      store.hotels = hotels as Hotel[];
      store.filters.orderBy = 'price';

      expect(store.filteredAndSortedHotels[0]?.totalPrice).toBe(100);
    });

    it('deve ordenar hotéis pelas estrelas', () => {
      const store = useHotelStore();
      const hotels: Partial<Hotel>[] = [
        { id: 1, stars: '3' },
        { id: 2, stars: '5' },
      ];
      store.hotels = hotels as Hotel[];
      store.filters.orderBy = 'stars';

      expect(store.filteredAndSortedHotels[0]?.stars).toBe('5');
    });

    it('deve paginar os hotéis', () => {
      const store = useHotelStore();
      const hotels: Partial<Hotel>[] = Array.from({ length: 15 }, (_, i) => ({ 
        id: i, name: `H${i}`, totalPrice: 100, stars: '3' 
      }));
      store.hotels = hotels as Hotel[];
      store.pagination.page = 2;
      store.pagination.rowsPerPage = 10;

      expect(store.paginatedHotels).toHaveLength(5);
      expect(store.paginatedHotels[0]?.id).toBe(10);
    });

    it('deve calcular o total de páginas corretamente', () => {
      const store = useHotelStore();
      const hotels: Partial<Hotel>[] = Array.from({ length: 25 }, (_, i) => ({ id: i }));
      store.hotels = hotels as Hotel[];
      store.pagination.rowsPerPage = 10;

      expect(store.totalPages).toBe(3);
    });

    it('deve retornar 1 página total se não houver hotéis', () => {
      const store = useHotelStore();
      store.hotels = [];
      expect(store.totalPages).toBe(1);
    });
  });
});
