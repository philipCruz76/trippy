import { parseCategories } from '@/lib/data/parseCategories';

const { categories } = parseCategories();
export const SEARCH_CATEGORIES = Array.from(categories).join(',');
export const categoryIdMapping = parseCategories().idMapping;
export const POPULAR_DESTINATIONS =
  "London,Edinburgh,Manchester,Liverpool,Bath,Cambridge,Oxford,Prague,Brno,Karlovy Vary,Plzeň,Rome,Florence,Venice,Milan,Bologna,Naples,Turin,Palermo,Madrid,Barcelona,Seville,Valencia,Granada,Bilbao,Malaga,Paris,Nice,Marseille,Lyon,Bordeaux,Toulouse,Athens,Thessaloniki,Heraklion,Rhodes,Santorini,Oslo,Bergen,Trondheim,Warsaw,Kraków,Gdańsk,Wrocław,Stockholm,Gothenburg,Malmö,Uppsala,Vienna,Salzburg,Innsbruck,Graz,Brussels,Bruges,Ghent,Antwerp,Dubrovnik,Split,Zagreb,Zadar,Copenhagen,Aarhus,Odense,Helsinki,Turku,Rovaniemi,Berlin,Munich,Frankfurt,Hamburg,Cologne,Dresden,Leipzig,Budapest,Debrecen,Szeged,Reykjavik,Akureyri,Selfoss,Dublin,Cork,Galway,Lisbon,Porto,Faro,Lagos,Albufeira,Coimbra,Amsterdam,Rotterdam,Utrecht,The Hague,Zurich,Geneva,Lucerne,Interlaken";
