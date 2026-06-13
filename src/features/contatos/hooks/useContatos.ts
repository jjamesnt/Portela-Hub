import { useState, useEffect } from 'react';
import { ContatoUnificado } from '../schemas/contatosSchema';
import { fetchContatosUnificados } from '../services/contatosApi';

export const useContatos = () => {
    const [contatos, setContatos] = useState<ContatoUnificado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const loadContatos = async () => {
        setLoading(true);
        const data = await fetchContatosUnificados();
        setContatos(data);
        setLoading(false);
    };

    useEffect(() => {
        loadContatos();
    }, []);

    const filteredContatos = contatos.filter(contato => {
        const matchesSearch = 
            contato.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contato.cargoOuPartido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contato.municipioOuRegiao.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'Todos' || contato.tipo === filterType;
        
        // Exemplo: se tivéssemos um filtro "Meus Cadastros"
        if (filterType === 'Meus Cadastros') {
            // Note: Para isso funcionar 100%, precisaríamos passar o nome do user logado pro hook
            // ou ter um estado "onlyMyContacts". Por hora, vamos manter os filtros originais.
        }

        return matchesSearch && matchesType;
    });

    const totalPages = Math.max(1, Math.ceil(filteredContatos.length / itemsPerPage));
    const paginatedContatos = filteredContatos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = contatos.reduce((acc, c) => {
        if (c.cadastradoPorNome) {
            acc[c.cadastradoPorNome] = (acc[c.cadastradoPorNome] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return {
        contatos,
        loading,
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedContatos,
        stats,
        reload: loadContatos
    };
};
