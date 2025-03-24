/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, Moon, Sun } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

type UptimeStatus = "good" | "bad" | "unknown";


function StatusCircle({status} : {status : UptimeStatus}) {
     return (
        <div className={`w-3 h-3 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'bad' ? 'bg-red-500' : 'bg-gray-500'}`} />
     );
}

function UptimeTicks({ticks} : {ticks : UptimeStatus[]}) {
    return (
       <div className="flex gap-1 mt-2">
         {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === 'good' ? 'bg-green-500' : tick === 'bad' ? 'bg-red-500' : 'bg-gray-500'
          }`}
        />
      ))}
       </div>
    );
}

function createWebsiteModal({isOpen , onClose} : { isOpen: boolean; onClose: (url: string | null) => void }) {
    const [url, setUrl] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Website</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => onClose(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => onClose(url)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Website
                </button>
              </div>
          </div>
        </div>
      );
    }
    
    interface ProcessedWebsite {
        id: string;
        url: string;
        status: UptimeStatus;
        uptimePercentage: number;
        lastChecked: string;
        uptimeTicks: UptimeStatus[];
      }

      function WebsiteCard({ website }: { website: ProcessedWebsite }) {
        const [isExpanded, setIsExpanded] = useState(false);
      
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div
              className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center space-x-4">
                <StatusCircle status={website.status} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{website.url}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {website.uptimePercentage.toFixed(1)}% uptime
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Last 30 minutes status:</p>
                  <UptimeTicks ticks={website.uptimeTicks} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Last checked: {website.lastChecked}
                </p>
              </div>
            )}
          </div>
        );
      }
      
    function App() {
      const [isDarkMode,setIsDarkMode] = useState(false)
      const [isModalOpen,setIsModalOpen] = useState(false)
      const {websites, refreshWebsites} = useWebsites();
      const { getToken } = useAuth();

      const processedWebsites = useMemo(() => {
        return websites.map(website => {
          // Sort ticks by creation time
          const sortedTicks = [...website.ticks].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
           
          const thirtyMinutesAgo = new Date(Date.now()- 30*60*1000);
          const recentTicks = sortedTicks.filter(tick => 
            new Date(tick.createdAt) > thirtyMinutesAgo
          );

          const windows : UptimeStatus[] = [];

          // making 10 windows of 3 seconds for measuring ticks

          for(let i=0; i<10; i++) {
            const windowStart = new Date(Date.now() - (i+1)*3*60*1000);
            const windowEnd = new Date(Date.now() - i*3*60*1000);

            const windowTicks = recentTicks.filter(tick => {
              const tickTime = new Date(tick.createdAt);
              return tickTime >=windowStart && tickTime<windowEnd;
            })

            //checking if that paricular window is up or not

            const upTicks = windowTicks.filter(tick => tick.status == 'Good').length;
            windows[9-i] = windowTicks.length == 0 ? 'unknown' : (upTicks/windowTicks.length) >= 0.5 ? "good" : "bad";

          }
           
          // checking for overall status 

          const totalTicks = sortedTicks.length;
          const upTicks = sortedTicks.filter(tick => tick.status == 'Good').length;
          const uptimePercentage = totalTicks == 0 ? 100 : (upTicks/totalTicks)*100;

          const currentStatus = windows[windows.length-1]

          const lastChecked = sortedTicks[0]
        ? new Date(sortedTicks[0].createdAt).toLocaleTimeString()
        : 'Never';

        return {
          id: website.id,
          url : website.url,
          status : currentStatus,
          uptimePercentage,
          lastChecked,
          uptimeTicks : windows,
              }
          })
      }, [websites])
    }