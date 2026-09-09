import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Employee Leave Management System`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
