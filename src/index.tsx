import { Action, ActionPanel, Color, Icon, List, open } from "@raycast/api";
import { Album, useFetchProject } from "./query";
import { getPreferences } from "./preferences";

// TODO: Make it configurable which app to open
const openAlbumInSpotify = (spotifyId: string) => {
  open("spotify://album/" + spotifyId);
};

const getIcon = (album: Album) => {
  // Get the icon with the smallest resolution
  return album.images.toSorted((a, b) => a.width - b.width)[0];
};

export default function Command() {
  const { data, isLoading, error, revalidate } = useFetchProject();

  return (
    // TODO: Make it possible to filter by rated, unrated, etc.
    <List isLoading={isLoading} searchBarPlaceholder="Search albums and artists">
      {error != null && (
        <List.EmptyView
          icon={Icon.Warning}
          title={error.message}
          actions={
            <ActionPanel>
              <Action title="Reload" onAction={revalidate} />
            </ActionPanel>
          }
        />
      )}
      {isLoading !== true && data != null && (
        <>
          {data.paused && (
            <List.Item
              key="paused"
              title={"Your project is paused"}
              icon={{ source: Icon.Warning, tintColor: Color.Orange }}
              actions={
                <ActionPanel>
                  <Action
                    title="Open Project"
                    icon={Icon.Globe}
                    onAction={() => open(`https://1001albumsgenerator.com/${data.name}`)}
                  />
                </ActionPanel>
              }
            />
          )}
          <List.Item
            key={data.currentAlbum.slug}
            icon={{ source: getIcon(data.currentAlbum).url, fallback: "disc-vinyl.svg" }}
            title={data.currentAlbum.name}
            subtitle={data.currentAlbum.artist}
            accessories={[{ tag: { value: "Current album", color: Color.Blue } }]}
            actions={<AlbumActionPanel album={data.currentAlbum} />}
            keywords={[...data.currentAlbum.name.split(" "), ...data.currentAlbum.artist.split(" ")]}
          />
          {data?.history?.map((item) => (
            <List.Item
              key={item.album.slug}
              icon={{ source: getIcon(item.album).url }}
              title={item.album.name}
              subtitle={item.album.artist}
              accessories={[
                {
                  tag: {
                    value: typeof item.rating === "number" ? item.rating.toString() : "Not rated",
                    color: typeof item.rating === "number" ? Color.Green : Color.Orange,
                  },
                },
              ]}
              actions={<AlbumActionPanel album={item.album} />}
              keywords={[...item.album.name.split(" "), ...item.album.artist.split(" ")]}
            />
          ))}
        </>
      )}
    </List>
  );
}

interface AlbumActionPanelProps {
  album: Album;
}

const AlbumActionPanel = ({ album }: AlbumActionPanelProps) => {
  return (
    <ActionPanel>
      <Action
        title="Open in Spotify"
        icon={{ source: "spotify-icon.svg", tintColor: "#FFFFFF" }}
        onAction={() => openAlbumInSpotify(album.spotifyId)}
      />
      <Action title="See Global Reviews" icon={Icon.Globe} onAction={() => open(album.globalReviewsUrl)} />
      <Action
        title="Open Project"
        icon={Icon.Globe}
        onAction={() => open(`https://1001albumsgenerator.com/${getPreferences().projectId}`)}
      />
      <Action
        title="Open History on Web"
        icon={Icon.List}
        onAction={() => open(`https://1001albumsgenerator.com/${getPreferences().projectId}/history`)}
      />
    </ActionPanel>
  );
};
