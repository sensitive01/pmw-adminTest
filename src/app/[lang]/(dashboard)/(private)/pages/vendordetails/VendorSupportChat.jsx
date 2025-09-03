'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const VendorSupportChat = ({ vendorId }) => {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [sending, setSending] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [helpRequests, setHelpRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  })
  const [requestToComplete, setRequestToComplete] = useState(null)
  const [completingId, setCompletingId] = useState(null)

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (vendorId) {
      fetchHelpRequests()
    }
  }, [vendorId])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const fetchHelpRequests = async () => {
    if (!vendorId) return

    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/vendor/gethelpvendor/${vendorId}`)

      if (response.status === 200 && response.data?.helpRequests) {
        setHelpRequests(response.data.helpRequests)

        if (response.data.helpRequests.length > 0) {
          const sortedRequests = [...response.data.helpRequests].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setSelectedRequest(sortedRequests[0]);
          fetchChatData(sortedRequests[0]._id);
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching help requests:', error)
      setLoading(false)
    }
  }

  const fetchChatData = async (helpRequestId) => {
    if (!helpRequestId) return

    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/vendor/fetchchat/${helpRequestId}`)

      if (response.status === 200) {
        setChatMessages(response.data.chatbox || [])
      } else {
        setChatMessages([])
      }
    } catch (error) {
      console.error('Error fetching chat data:', error)
      setChatMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRequest = async (requestId) => {
    try {
      setCompletingId(requestId)
      const response = await axios.patch(
        `${API_URL}/admin/adminclosechat/${selectedRequest._id}`,
        { adminId: session?.user?.id } 
      );

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Request marked as completed',
          severity: 'success'
        })

        setHelpRequests(prev =>
          prev.map(req =>
            req._id === requestId
              ? { ...req, status: 'Completed', closedAt: new Date().toISOString() }
              : req
          )
        )

        if (selectedRequest?._id === requestId) {
          setSelectedRequest(prev => ({
            ...prev,
            status: 'Completed',
            closedAt: new Date().toISOString()
          }))
        }
      }
    } catch (error) {
      console.error('Error completing request:', error)
      setSnackbar({
        open: true,
        message: 'Failed to complete request',
        severity: 'error'
      })
    } finally {
      setCompletingId(null)
      setRequestToComplete(null)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!message.trim() && !selectedImage) return
    if (!selectedRequest?._id || !vendorId) {
      setSnackbar({
        open: true,
        message: 'Cannot send message: Missing request ID or vendor ID',
        severity: 'error'
      })
      return
    }

    try {
      setSending(true)

      const formData = new FormData()
      formData.append('vendorid', vendorId)
      formData.append('message', message)

      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await axios.post(
        `${API_URL}/vendor/sendchat/${selectedRequest._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.status === 200) {
        const newMessage = {
          userId: vendorId,
          message: message,
          image: selectedImage ? URL.createObjectURL(selectedImage) : null,
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString()
        }

        setChatMessages(prev => [...prev, newMessage])
        setMessage('')
        setSelectedImage(null)

        setTimeout(() => fetchChatData(selectedRequest._id), 500)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setSnackbar({
        open: true,
        message: 'Failed to send message',
        severity: 'error'
      })
    } finally {
      setSending(false)
    }
  }

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleRequestSelect = (request) => {
    setSelectedRequest(request)
    fetchChatData(request._id)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }

  const isCurrentUser = (messageUserId) => {
    return messageUserId === vendorId
  }

  const formatRequestDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#c8e6c9' // Green
      case 'Resolved':
        return '#bbdefb' // Blue
      case 'In Progress':
        return '#fff9c4' // Yellow
      default:
        return '#ffccbc' // Orange for Pending/other statuses
    }
  }

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#2e7d32' // Dark Green
      case 'Resolved':
        return '#1565c0' // Dark Blue
      case 'In Progress':
        return '#f57f17' // Dark Yellow/Orange
      default:
        return '#d84315' // Dark Orange for Pending/other statuses
    }
  }

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader
        title="Support Requests & Chat"
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
      />
      <CardContent>
        {helpRequests.length === 0 ? (
          <Alert severity="info">No support requests found. Create a support request if you need assistance.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '600px' }}>
            {/* Request List */}
            <Box
              sx={{
                width: { xs: '100%', md: '30%' },
                pr: { xs: 0, md: 2 },
                mb: { xs: 2, md: 0 },
                borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
                height: '100%',
                overflowY: 'auto'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Your Requests</Typography>

              {helpRequests.map((request) => (
                <Paper
                  key={request._id}
                  elevation={selectedRequest?._id === request._id ? 3 : 1}
                  sx={{
                    mb: 1,
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: selectedRequest?._id === request._id ? '#e3f2fd' : 'white',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onClick={() => handleRequestSelect(request)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold', flex: 1 }}>
                      {request.description.substring(0, 30)}
                      {request.description.length > 30 ? '...' : ''}
                    </Typography>

                    {request.status === 'Pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRequestToComplete(request._id)
                        }}
                        disabled={completingId === request._id}
                        sx={{
                          ml: 1,
                          textTransform: 'none',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          minWidth: '80px'
                        }}
                      >
                        {completingId === request._id ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          'Complete'
                        )}
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      {formatRequestDate(request.createdAt)}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(request.status),
                        color: getStatusTextColor(request.status),
                        fontWeight: 'bold'
                      }}
                    >
                      {request.status || 'Pending'}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Chat Box */}
            <Box sx={{ width: { xs: '100%', md: '70%' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {selectedRequest && (
                <>
                  <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedRequest.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Request ID: {selectedRequest._id} • Created: {formatRequestDate(selectedRequest.createdAt)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5,
                          py: 0.8,
                          borderRadius: '12px',
                          backgroundColor: getStatusColor(selectedRequest.status),
                          color: getStatusTextColor(selectedRequest.status),
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {selectedRequest.status === 'Completed' && <CheckCircleIcon sx={{ fontSize: 14 }} />}
                        {selectedRequest.status || 'Pending'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    ref={chatContainerRef}
                    sx={{
                      flexGrow: 1,
                      p: 2,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      mb: 2
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : chatMessages.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        backgroundColor: '#e8f5e9',
                        borderRadius: 1,
                        p: 3
                      }}>
                        <Typography color="#2e7d32" fontWeight="bold">
                          Chat not found
                        </Typography>
                      </Box>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: isCurrentUser(msg.userId) ? 'flex-end' : 'flex-start',
                            mb: 2
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              p: 2,
                              borderRadius: 2,
                              bgcolor: isCurrentUser(msg.userId) ? '#e3f2fd' : '#f5f5f5',
                              boxShadow: 1
                            }}
                          >
                            {!isCurrentUser(msg.userId) && (
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Support Team
                              </Typography>
                            )}

                            <Typography variant="body1">
                              {msg.message}
                            </Typography>

                            {msg.image && (
                              <Box
                                component="img"
                                src={msg.image.startsWith('blob:') ? msg.image : msg.image}
                                alt="Chat image"
                                sx={{
                                  maxWidth: '100%',
                                  maxHeight: 200,
                                  mt: 1,
                                  borderRadius: 1
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/broken-image.png';
                                }}
                              />
                            )}

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                              {msg.time || formatDate(msg.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Input Area or Completed Message */}
                  {selectedRequest.status !== 'Completed' ? (
                    <Box
                      component="form"
                      onSubmit={sendMessage}
                      sx={{
                        p: 2,
                        bgcolor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                      />

                      <IconButton
                        color="primary"
                        onClick={() => fileInputRef.current.click()}
                        sx={{ mr: 1 }}
                      >
                        <ImageIcon />
                      </IconButton>

                      {selectedImage && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, px: 1, py: 0.5, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedImage.name}
                          </Typography>
                        </Box>
                      )}

                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        size="small"
                        sx={{ mx: 1 }}
                      />

                      <IconButton
                        color="primary"
                        type="submit"
                        disabled={sending || (!message.trim() && !selectedImage)}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                            color: 'action.disabled'
                          }
                        }}
                      >
                        {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                      </IconButton>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      This conversation has been marked as completed. No further messages can be sent.
                    </Alert>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Completion Confirmation Dialog */}
      <Dialog
        open={Boolean(requestToComplete)}
        onClose={() => setRequestToComplete(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Completion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to mark this request as completed? This will close the conversation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestToComplete(null)}>Cancel</Button>
          <Button
            onClick={() => handleCompleteRequest(requestToComplete)}
            color="success"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default VendorSupportChat
