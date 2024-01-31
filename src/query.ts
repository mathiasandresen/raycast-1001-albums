import { Cache } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { getPreferences } from "./preferences";

interface Image {
  url: string;
  width: number;
  height: number;
}

export interface Album {
  artist: string;
  name: string;
  spotifyId: string;
  images: Image[];
  slug: string;
  globalReviewsUrl: string;
}

interface HistoryItem {
  album: Album;
  rating: number | 'did-not-listen' | null;
  globalRating: number;
  generatedAt: string;
}

interface Project {
  name: string;
  currentAlbum: Album;
  history: HistoryItem[];
  paused: boolean;
}

const cache = new Cache();

export const useFetchProject = () => {
  const { projectId } = getPreferences();

  return useFetch<Project>(`https://1001albumsgenerator.com/api/v1/projects/${projectId}`, {
    keepPreviousData: true,
    initialData: cache.get("project") ? JSON.parse(cache.get("project")!) : undefined,
    parseResponse: async (response) => {
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        }
        throw new Error("An error occurred while fetching the project.");
      }

      const json = await response.json() as Project;
      json.history = json.history.toSorted((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

      cache.set("project", JSON.stringify(json));

      return json;
    },
  }); 
};
