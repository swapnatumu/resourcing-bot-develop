import React from 'react';
import { Button, Typography,TableCell } from '@mui/material';


const Pagination = ({ itemsPerPage, currentPage, totalPages, handlePrevPage, handleNextPage }) => {
  return (
    <TableCell colSpan={6} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" component="span">{`Items per page: ${itemsPerPage}`}</Typography>
      <div>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>{'<'}</Button>
        <Typography variant="body1" component="span" style={{ margin: '0 20px' }}>{`${currentPage} of ${totalPages}`}</Typography>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>{'>'}</Button>
      </div>
    </TableCell>
  );
};

export default Pagination;
