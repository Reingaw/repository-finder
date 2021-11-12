import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Owner, 
    Loading, 
    BackButton, 
    IssuesList, 
    PageActions,
    FilterOptions } from './styles';
import { FaArrowLeft } from 'react-icons/fa';

import api from '../../services/api';

export default function Repos({match}) {

    const [repository, setRepository] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');

    useEffect(()=>{

        async function load(){
            const nomeRepo = decodeURIComponent(match.params.repository);

            const [repoData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`, {
                    params:{
                        state: filter,
                        per_page: 5
                    }
                })
            ]);

            setRepository(repoData.data);
            setIssues(issuesData.data);
            setLoading(false);
        }

        load();

    },[match.params.repository]);

    useEffect(()=> {

        async function loadIssue() {
            const nomeRepo = decodeURIComponent(match.params.repository);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params: {
                    state: filter,
                    page,
                    per_page: 5
                }
            });

            setIssues(response.data);
        }

        loadIssue();

    }, [page, filter]);

    function handlePage(action) {
        setPage(action === 'prev' ? page - 1 : page + 1);
    }

    function handleFilter(option) {
        switch(option){
            case 'all':
                setFilter('all');
                break;
            case 'open':
                setFilter('open');
                break;
            case 'closed':
                setFilter('closed');
                break;
            default:
        }
    }

    if(loading) {
        return(
            <Loading>
                <h1>Carregando</h1>
            </Loading>
        );
    }

    return(
        <Container style={{color: '#FFF'}}>
            <BackButton to="/">
                <FaArrowLeft color="#000" size={30} />
            </BackButton>
            <Owner>
                <img src={repository.owner.avatar_url} alt={repository.owner.login} />
                <h1>{repository.name}</h1>
                <p>{repository.description}</p>
            </Owner>

            <FilterOptions>
                <button 
                type="button" 
                onClick={()=> handleFilter('all')}
                disabled={filter === 'all'}>All</button>
                <button 
                type="button" 
                onClick={()=> handleFilter('open')}
                disabled={filter === 'open'}>Open</button>
                <button 
                type="button" 
                onClick={()=> handleFilter('closed')}
                disabled={filter === 'closed'}>Closed</button>
            </FilterOptions>

            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login} />
                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>

                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>
                    </li>
                ))}
            </IssuesList>

            <PageActions>
                <button 
                    type="button" 
                    onClick={()=> handlePage('prev')}
                    disabled={page < 2}>Prev</button>

                <button type="button" onClick={()=> handlePage('next')}>Next</button>
            </PageActions>

        </Container>
    );
}