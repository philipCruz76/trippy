import { KeywordClassificationsType } from "@/lib/actions/chat/getKeywordClassifications";
import { LatLngResult } from "@/lib/actions/chat/getLatLng";
import { create } from "zustand";
import { produce } from "immer";
import { DailyItineraryType } from "../actions/chat/getDailyItinerary";
type GPTResponseState = {
  keywords: KeywordClassificationsType;
  geoLocation: LatLngResult;
  dailyItinerary: DailyItineraryType;
  gptInteractionStarted: boolean;
  setKeywords: (keywords: KeywordClassificationsType) => void;
  setGeoLocation: (geoLocation: LatLngResult) => void;
  setDailyItinerary: (dailyItinerary: DailyItineraryType) => void;
  getKeyWords: () => KeywordClassificationsType;
  getGeoLocation: () => LatLngResult;
  getDailyItinerary: () => DailyItineraryType;
  setActivityCoverPhoto: (dayIndex: number, activityIndex: number, coverPhoto: string) => void;
  setGptInteractionStarted: (gptInteractionStarted: boolean) => void;
  getGptInteractionStarted: () => boolean;
};

export const useGPTResponseStore = create<GPTResponseState>()((set, get) => ({
  keywords: {
    activity: "",
    duration: "",
    location: "",
    activityTypes: [""],
    excludedTypes: [""],
  },
  geoLocation: {
    lat: 0,
    lng: 0,
  },
  dailyItinerary: {
    summary:"",
    days:[{
      title:"",
      description:"",
      activities:[{
        index: 0,
        name:"",
        id:"",
        coverPhoto:"",
        location:{
          lat:0,
          lng:0
        }
      }]
    }]
  },
  
  gptInteractionStarted: false,

  setGptInteractionStarted(gptInteractionStarted) {
    set(
      produce((state) => {
        state.gptInteractionStarted = gptInteractionStarted;
      }),
    );
  },
  setKeywords(keywords) {
    set(
      produce((state) => {
        state.keywords = keywords;
      }),
    );
  },
  setGeoLocation(geoLocation) {
    set(
      produce((state) => {
        state.geoLocation = geoLocation;
      }),
    );
  },
  setDailyItinerary(dailyItinerary) {
    set(
      produce((state) => {
        state.dailyItinerary = dailyItinerary;
      }),
    );
  },
  getKeyWords: () => {
    return get().keywords;
  },
  getGeoLocation: () => {
    return get().geoLocation;
  },
  getDailyItinerary: () => {
    return get().dailyItinerary;
  },
  setActivityCoverPhoto(dayIndex, activityIndex, coverPhoto) {
    set(
      produce((state) => {
        if (state.dailyItinerary.days[dayIndex]?.activities[activityIndex]) {
          state.dailyItinerary.days[dayIndex].activities[activityIndex].coverPhoto = coverPhoto;
        }
      }),
    );
  },
  getGptInteractionStarted: () => {
    return get().gptInteractionStarted;
  },
}));
