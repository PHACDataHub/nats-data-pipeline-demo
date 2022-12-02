import dotenv from 'dotenv'
import { AbortSignal } from "node-abort-controller";
global.AbortSignal = AbortSignal;
dotenv.config({ path: './.test.env' })
