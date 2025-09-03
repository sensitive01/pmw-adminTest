'use client'

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Avatar,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';

const UserListModal = ({ open, onClose, onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/allusers`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userMobile?.includes(searchTerm)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select User</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name or mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={user.image} alt={user.userName} />
                          <Typography>{user.userName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.userMobile}</TableCell>
                      <TableCell>{user.userEmail || 'N/A'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => onUserSelect(user)} // Pass the whole user object
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserListModal;
