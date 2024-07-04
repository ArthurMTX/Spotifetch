"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlaylistInfo } from "@/services/api";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
    Spinner
} from "@nextui-org/react";
import {useAsyncList} from "@react-stately/data";

const Dashboard = () => {
    const params = useParams();
    const playlistId = params.playlistId;
    const [playlistInfo, setPlaylistInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const list = useAsyncList({
        async load({signal}) {
            if (!playlistId) {
                alert('Playlist ID is missing in the URL');
                return { items: [] };
            }
            try {
                const info = await getPlaylistInfo(playlistId as string, { signal });
                setPlaylistInfo(info);  // Assure-toi que les informations de la playlist sont bien stockées
                setIsLoading(false);
                return { items: info.tracks };
            } catch (error) {
                console.error('Failed to fetch playlist info:', error);
                alert('Failed to fetch playlist info');
                setIsLoading(false);
                return { items: [] };
            }
        },
        async sort({items, sortDescriptor}) {
            return {
                items: items.sort((a, b) => {
                    let first = a[sortDescriptor.column];
                    let second = b[sortDescriptor.column];
                    let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

                    if (sortDescriptor.direction === "descending") {
                        cmp *= -1;
                    }

                    return cmp;
                }),
            };
        },
    });

    useEffect(() => {
        if (playlistId) {
            list.reload();
        }
    }, [playlistId]);

    const renderCell = (track, columnKey) => {
        const cellValue = track[columnKey];
        switch (columnKey) {
            case "name":
                return <User avatarProps={{ src: track.album_cover, radius: "sm", className: "w-20 h-20 text-large"}}  name={cellValue} description={track.album_name} />;
            case "artists":
                return <p>{cellValue}</p>;
            case "popularity":
                return <Chip color="success" size="sm">{cellValue}</Chip>;
            case "duration":
                return <p>{cellValue}</p>;
            default:
                return cellValue;
        }
    };

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            {isLoading && <Spinner label="Loading playlist info..." />}
            {!isLoading && playlistInfo && (
                <div className="max-w-6xl">
                    <h2 className="text-2xl font-bold mb-4">{playlistInfo.name}</h2>
                    <img src={playlistInfo.image} alt={playlistInfo.name} className="w-full h-auto mb-4" />
                    <p><strong>Description:</strong> {playlistInfo.description}</p>
                    <p><strong>Followers:</strong> {playlistInfo.followers}</p>
                    <p><strong>URL:</strong> <a href={playlistInfo.url} target="_blank" rel="noopener noreferrer">{playlistInfo.url}</a></p>
                    <p><strong>Owner:</strong> {playlistInfo.owner}</p>
                    {playlistInfo.owner_image && <img src={playlistInfo.owner_image} alt={playlistInfo.owner} className="w-16 h-16 rounded-full mb-4" />}

                    <h3 className="text-xl font-bold mt-4">Tracks</h3>
                    <Table
                        aria-label="Track list"
                        sortDescriptor={list.sortDescriptor}
                        onSortChange={list.sort}
                    >
                        <TableHeader>
                            <TableColumn key="name" allowsSorting>Name</TableColumn>
                            <TableColumn key="artists" allowsSorting>Artists</TableColumn>
                            <TableColumn key="popularity" allowsSorting>Popularity</TableColumn>
                            <TableColumn key="duration" allowsSorting>Duration</TableColumn>
                        </TableHeader>
                        <TableBody
                            items={list.items}
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading..." />}
                        >
                            {(track) => (
                                <TableRow key={track.id || track.name + track.duration}>
                                    {(columnKey) => <TableCell>{renderCell(track, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    );
}

export default Dashboard;