
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
import RecursosRelatorioPage from './pages/RecursosRelatorioPage';

interface PageState {
  page: string;
  params?: { [key: string]: any };
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>(() => {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);

    if (params.get('report') === 'recursos') {
      return { page: 'RecursosRelatorio' };
    }

    if (path.includes('/municipios')) return { page: 'Municípios' };
    if (path.includes('/liderancas')) return { page: 'Lideranças' };
    if (path.includes('/assessores')) return { page: 'Assessores' };
    if (path.includes('/agenda')) return { page: 'Agenda' };
    if (path.includes('/recursos')) return { page: 'Recursos' };
    if (path.includes('/demandas')) return { page: 'Demandas' };
    if (path.includes('/configuracoes')) return { page: 'Configurações' };

    return { page: 'Dashboard' };
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const navigateTo = (page: string, params?: { [key: string]: any }) => {
    setCurrentPage({ page, params });

    const pathMap: { [key: string]: string } = {
      'Dashboard': '/',
      'Municípios': '/municipios',
      'Lideranças': '/liderancas',
      'Assessores': '/assessores',
      'Agenda': '/agenda',
      'Recursos': '/recursos',
      'Demandas': '/demandas',
      'Configurações': '/configuracoes'
    };

    if (pathMap[page]) {
      window.history.pushState({}, '', pathMap[page]);
    }
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
      case 'RecursosRelatorio':
        return <RecursosRelatorioPage />;
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

  // If it's the report page, render only the content (no sidebar/header)
  if (currentPage.page === 'RecursosRelatorio') {
    return (
      <AppProvider>
        <main className="min-h-screen bg-white">
          {renderContent()}
        </main>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <div className="flex h-screen-dynamic w-full overflow-hidden">
        <Sidebar
          activePage={currentPage.page}
          setActivePage={(page) => navigateTo(page)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark w-full px-safe-left px-safe-right">
            {renderContent()}
          </main>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
