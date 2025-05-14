import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Пытаемся определить язык из URL, иначе по умолчанию 'kz'
    const path = router.asPath;
    let lang = 'ru'; // fallback

    if (path.startsWith('/ru')) lang = 'ru';
    else if (path.startsWith('/en')) lang = 'en';

    router.replace(`/${lang}/home`);
  }, []);

  return null; // ничего не показываем
}
