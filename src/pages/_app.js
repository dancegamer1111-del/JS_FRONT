import "../styles/globals.css";
import Navigation from "../components/Navigation";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";


export default function App({ Component, pageProps }) {
  const router = useRouter();
  const path = router.asPath;

  const showNavigation =
    path.startsWith("/kz/home") ||
    path.startsWith("/kz/experts/all") ||
    path.startsWith("/kz/vacancies") ||
    path.startsWith("/kz/certificates") ||
    path.startsWith("/kz/events") ||
    path.startsWith("/kz/courses") ||
    path.startsWith("/ru/experts/all") ||
    path.startsWith("/ru/vacancies") ||
    path.startsWith("/ru/home") ||
    path.startsWith("/ru/certificates") ||
    path.startsWith("/ru/events") ||
    path.startsWith("/ru/courses") ||
    path.startsWith("/en/experts/all") ||
    path.startsWith("/en/my_sites") ||
    path.startsWith("/en/certificates") ||
    path.startsWith("/en/events") ||
    path.startsWith("/en/blog") ||
    path.startsWith("/experts/all") ||
    path.startsWith("/vacancies") ||
    path.startsWith("/about") ||
    path.startsWith("/events") ||
    path.startsWith("/courses");

  return (
    <>
      {/* Add Yandex Metrika component */}

      {showNavigation && <Navigation />}
      <Component {...pageProps} />
    </>
  );
}