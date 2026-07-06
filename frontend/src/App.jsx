import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import { DashboardProvider } from './context/DashboardContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <FilterProvider>
          <DashboardProvider>
            <AppRoutes />
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                duration: 4000,
              }}
            />
          </DashboardProvider>
        </FilterProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
