import { useState, useEffect } from 'react';

const JobBoard = () => {
    const [jobPostings, setJobPostings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMorePostings, setHasMorePostings] = useState(true); // Track whether there are more postings to load

    const fetchJobDetails = async (jobId) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${jobId}.json`);
        const data = await response.json();
        return data;
    };

    const fetchJobPostings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
            const jobIds = await response.json();
            const startIndex = (currentPage - 1) * 6;
            const endIndex = startIndex + 6;
            const jobPromises = jobIds.slice(startIndex, endIndex).map(jobId => fetchJobDetails(jobId));
            // eslint-disable-next-line no-undef
            const jobDetails = await Promise.all(jobPromises);
            setJobPostings([...jobPostings, ...jobDetails]);

            // Check if there are more postings to load
            if (jobIds.length <= endIndex) {
                setHasMorePostings(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasMorePostings) {
            fetchJobPostings();
        }
    }, [currentPage, hasMorePostings]); // Fetch job postings when the component mounts, whenever currentPage changes, and if there are more postings to load

    return (
        <div className="job-board">
            {jobPostings.map(job => (
                <div className="job-post" key={job.id}>
                    <h2>{job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a> : job.title}</h2>
                    <p>Posted by {job.by} on {new Date(job.time * 1000).toLocaleDateString()}</p>
                </div>
            ))}
            {hasMorePostings && (
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Load More'}
                </button>
            )}
        </div>
    );
};

export default JobBoard;
