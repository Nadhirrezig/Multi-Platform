import React from 'react';
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Button, FlatList, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
interface ServerToClientEvents {
  'new-message': (message: string) => void;
}

interface ClientToServerEvents {
  'join-room': (room: string) => void;
  'send-message': (data: { room?: string; message: string }) => void;
}
// backend URL is going to change later specially when deploying the app , for now we are just testing , local testing
const backendURL = 'http://192.168.1.16:4000'; // Your IP

export default function App() {
  // bitbi3a copy past habibi 5atr ti5dem fi REACT doesnt matter nativ or web lkolo JAVASCRIPT HAHAHAHAHAHHAHAHAHA , i love you
  const [roomName, setRoomName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  useEffect(() => {
    const socket = io(backendURL);
    socketRef.current = socket;
    console.log('Connecting to:', backendURL);
    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('new-message', (newMessage: string) => {
      console.log('Received:', newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });
    socket.on('connect_error', (err) => console.error('Socket error:', err));
    // fetching data from the server when the user connects , im tired 
    fetch(`${backendURL}/messages`)
    .then((res) => res.json())
    .then((data) => {
      console.log('Fetched messages:', data);
      setMessages(data.map((msg: { message: string }) => msg.message));
    })
    .catch((err) => console.error('Fetch messages failed:', err));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join room when button is clicked
  const joinRoom = () => {
    if (roomName && socketRef.current) {
      socketRef.current.emit('join-room', roomName);
      console.log(`Joined room: ${roomName}`);
    } else {
      console.log('Room name is empty');
    }
  };

  const sendMessage = () => {
    if (message && socketRef.current) {
      const data = { message, ...(roomName && { room: roomName }) };
      socketRef.current.emit('send-message', data);
      setMessage('');
    } else {
      console.log('Message is empty');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile App</Text>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message"
      />
      <TextInput
        style={styles.input}
        value={roomName}
        onChangeText={setRoomName}
        placeholder="Type a room name"
      />
      <Button title="Send" onPress={sendMessage} />
      <Button title="Join ROOM" onPress={joinRoom} />
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <StatusBar style="auto" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 16,
    marginVertical: 5,
  },
});
