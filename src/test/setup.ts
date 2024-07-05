import {config} from 'dotenv';
export default ()=> config({path: '.env.'+process.env.NODE_ENV})