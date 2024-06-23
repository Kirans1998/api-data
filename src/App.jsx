import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Pagination, CircularProgress } from '@mui/material';

const App = () => {
    const [blogs, setBlogs] = useState([]);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const blogsPerPage = 10;
    const totalBlogsToFetch = 100;

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const initialResponse = await axios.get(
                `https://api.eligo.cloud/wp-json/wp/v2/blog`,
                {
                    params: {
                        page: 1,
                        per_page: blogsPerPage,
                        fields: 'acf',
                        acf_format: 'standard'
                    }
                }
            );

            const totalCount = parseInt(initialResponse.headers['x-wp-total']);
            setTotalBlogs(totalCount);

            const totalPages = Math.ceil(Math.min(totalBlogsToFetch, totalCount) / blogsPerPage);
            const requests = [];

            for (let page = 1; page <= totalPages; page++) {
                requests.push(
                    axios.get(
                        `https://api.eligo.cloud/wp-json/wp/v2/blog`,
                        {
                            params: {
                                page: page,
                                per_page: blogsPerPage,
                                fields: 'id,date,title,content,blog_category,acf,_links',
                                acf_format: 'standard'
                            }
                        }
                    )
                );
            }

            const responses = await Promise.all(requests);
            const allBlogs = responses.flatMap(response => response.data);

            setBlogs(allBlogs.slice(0, totalBlogsToFetch));
        } catch (error) {
            setError('Error fetching blogs');
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const displayBlogs = blogs.slice(
        (currentPage - 1) * blogsPerPage,
        currentPage * blogsPerPage
    );

    return (
        <Box sx={{ width: '100%', maxWidth: '100%', margin: '0 auto', marginTop: '4%' }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    List of Data
                </Typography>
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <Typography variant="body1" color="error">{error}</Typography>
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Category</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayBlogs.map(blog => (
                                    <TableRow key={blog.id}>
                                        <TableCell>{blog.id}</TableCell>
                                        <TableCell>{new Date(blog.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{blog.title ? <div>{blog.title.rendered}</div> : 'N/A'}</TableCell>
                                        <TableCell>{blog.acf.blog_descritpion ? <div>{blog.acf.blog_descritpion}</div> : 'N/A'}</TableCell>
                                        <TableCell>{blog.blog_category && blog.blog_category.length > 0 ? blog.blog_category[0] : 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2, marginTop: 2 }}>
                        <Pagination
                            count={Math.ceil(totalBlogs / blogsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        Page {currentPage}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default App;
