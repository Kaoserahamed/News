// Jest setup file for global test configuration
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder (required by MongoDB driver in jsdom environment)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
