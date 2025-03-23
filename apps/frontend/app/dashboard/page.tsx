/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, Moon, Sun } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

type UptimeStatus = "good" | "bad" | "unknown";
