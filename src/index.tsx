import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { IArtist, IArtistDetails, IObjectOf } from './api';
import { fetchArtists, fetchTopArtists, fetchArtistDetails } from './fetch';
import { ArtistCard } from './components';

const App = () => {
	const [ search, setSearch ] = useState<string>('');
	const [ timeoutId, setTimeoutId ] = useState<number>(0);
	const [ artists, setArtists ] = useState<IArtist[]>([]);
	const [ artistClass, setArtistClass ] = useState<string>('');
	const [ details, setDetails ] = useState<IObjectOf<IArtistDetails>>({});
	const [ selectedArtist, setSelectedArtist ] = useState<string | null>(null);
	const [ loadingArtist, setLoadingArtist ] = useState<string | null>(null);
	const [ loading, setLoading ] = useState<boolean>(false);

	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const val = (e.target as HTMLInputElement).value
		if (timeoutId > 0) {
			clearTimeout(timeoutId);
		}
		setSearch(val);
		if (val.length) {
			const id = window.setTimeout(async () => {
				setLoading(true);
				const data = await fetchArtists(val);
				setArtists(data);
				setLoading(false);
				if (artists.length) {
					setArtistClass('fade-out')
					setTimeout(() => setArtistClass(''), 500)
				}
			}, 650)
			setTimeoutId(id);
		} else {
			setArtists([])
		}
	}, [artists, timeoutId, setArtists, setSearch, setTimeoutId, setArtistClass, setLoading])

	const handleTopArtistSearch = useCallback(async () => {
		setLoading(true);
		const data = await fetchTopArtists();
		setLoading(false);
		setArtists(data);
	}, [setArtists, setLoading])

	const onArtistClick = useCallback(async (name: string) => {
		if (!details[name]) {
			setLoadingArtist(name);
			const deets = await fetchArtistDetails(name);
			setDetails({ ...details, [name]: deets })
		}
		setSelectedArtist(name);
	}, [details, setDetails, setSelectedArtist, setLoadingArtist])

	return (
		<div className='container app-wrapper'>
			<input className={`input search-bar ${loading ? 'loading-background' : ''}`} type='text' placeholder='Search artists' value={search} onChange={handleSearchChange} />
			<div className={`${artistClass} box`}>
			{
				artists.length
					? (
						<div className='fade-in'>
							{ artists.map((a: IArtist) =>
								<ArtistCard 
									key={a.id || a.name}
									artist={a}
									onClick={onArtistClick}
									details={details[a.name]}
									isSelected={a.name === selectedArtist}
									isLoading={a.name === loadingArtist}
								/>) }
						</div>
					) : (
						<h5 className='title is-5'>
							Enter an artist name or <a onClick={handleTopArtistSearch}>search top artists</a>
						</h5>
					)
			}
			</div>
		</div>
	)
}

ReactDOM.render(
  <App />,
  document.getElementById('app'),
)
