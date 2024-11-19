import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BadgeDetails from '../components/BadgeDetails';

const BadgePublicDisplay = () => {
    const { id_badge, razao_social } = useParams();

    useEffect(() => {
      console.log('id_badge:', id_badge);
      console.log('razao_social:', razao_social);
    }, []);

    return (
        <div className="badge-details-page">
          <BadgeDetails id_badge={id_badge} razao_social={razao_social}/>
        </div>
      );  
}

export default BadgePublicDisplay;
