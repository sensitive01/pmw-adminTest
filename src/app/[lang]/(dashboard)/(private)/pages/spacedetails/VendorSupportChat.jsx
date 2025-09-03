'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
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

// Icon Imports
import SendIcon from '@mui/icons-material/Send'
import ImageIcon from '@mui/icons-material/Image'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

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
        
        // Select the most recent help request by default
        if (response.data.helpRequests.length > 0) {
          const sortedRequests = [...response.data.helpRequests].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
          setSelectedRequest(sortedRequests[0])
          fetchChatData(sortedRequests[0]._id)
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching help requests:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load support requests',
        severity: 'error'
      })
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
      }
    } catch (error) {
      console.error('Error fetching chat data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load chat messages',
        severity: 'error'
      })
    } finally {
      setLoading(false)
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
        // Add new message to chat
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
        
        // Refresh chat data after sending
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
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
                    {request.description.substring(0, 30)}
                    {request.description.length > 30 ? '...' : ''}
                  </Typography>
                  
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
                        backgroundColor: 
                          request.status === 'Resolved' ? '#c8e6c9' : 
                          request.status === 'In Progress' ? '#fff9c4' : 
                          '#ffccbc'
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
                  <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedRequest.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Request ID: {selectedRequest._id} • Status: {selectedRequest.status || 'Pending'}
                    </Typography>
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
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography color="text.secondary">
                          No messages yet. Start the conversation!
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
                  
                  {/* Input Area */}
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
    </Card>
  )
}

export default VendorSupportChat
