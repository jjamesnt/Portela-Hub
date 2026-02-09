
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MunicipioDetalhesPage from './pages/MunicipioDetalhesPage';
import DashboardPage from './pages/DashboardPage';
import MunicipiosPage from './pages/MunicipiosPage';
import LiderancasPage from './pages/LiderancasPage';
import AssessoresPage from './pages/AssessoresPage';
import AgendaPage from './pages/AgendaPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import GestaoRecursosPage from './pages/GestaoRecursosPage';
import DemandasPage from './pages/DemandasPage';
import DemandaMunicipioPage from './pages/DemandaMunicipioPage';

interface PageState {
  page: string;
  params?: { [key: string]: any };
}


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>({ page: 'Dashboard' });
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const navigateTo = (page: string, params?: { [key: string]: any }) => {
    setCurrentPage({ page, params });
  };

  const renderContent = () => {
    switch (currentPage.page) {
      case 'Dashboard':
        return <DashboardPage navigateTo={navigateTo} />;
      case 'Municípios':
        return <MunicipiosPage navigateTo={navigateTo} />;
      case 'MunicipioDetalhes':
        return <MunicipioDetalhesPage municipioId={currentPage.params?.id} navigateTo={navigateTo} />;
      case 'Lideranças':
        return <LiderancasPage navigateTo={navigateTo} />;
      case 'Assessores':
        return <AssessoresPage navigateTo={navigateTo} />;
      case 'Agenda':
        return <AgendaPage navigateTo={navigateTo} />;
      case 'Recursos':
        return <GestaoRecursosPage navigateTo={navigateTo} />;
      case 'Demandas':
        return <DemandasPage navigateTo={navigateTo} />;
      case 'DemandaMunicipio':
        return <DemandaMunicipioPage municipioId={currentPage.params?.municipioId} municipioNome={currentPage.params?.municipioNome || ''} demandaId={currentPage.params?.demandaId} navigateTo={navigateTo} />;
      case 'Configurações':
        return <ConfiguracoesPage navigateTo={navigateTo} />;
      default:
        return <div className="p-8">Página não encontrada</div>;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          activePage={currentPage.page}
          setActivePage={(page) => navigateTo(page)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            {renderContent()}
          </main>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
