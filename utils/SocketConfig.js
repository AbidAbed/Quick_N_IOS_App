import {io} from 'socket.io-client';
// const socket = io("http://localhost:8900");
// const socket = io("http://localhost:8900");

const socket = io('wss://novel-era.co:3002');
export default socket;
