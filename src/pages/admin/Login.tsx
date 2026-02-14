import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // No auth needed - redirect straight to admin
    navigate('/admin/products');
  }, [navigate]);

  return null;
}
