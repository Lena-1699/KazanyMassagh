import { useState, useEffect, useMemo } from 'react';

// Пароль для доступа к админ-панели
const ADMIN_PASSWORD = 'admin123';

// Доступные временные слоты для записи
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

// Стабильная доступность (симуляция: некоторые слоты уже заняты другими клиентами)
const SLOT_AVAILABILITY = [true, true, false, true, true, false, true, true, true, false, true, true];

// Дефолтный контент сайта
const DEFAULT_CONTENT = {
  heroTitle: 'Верните легкость телу за 60 минут в центре Казани',
  heroSubtitle: 'Профессиональный массаж от сертифицированных мастеров. Натуральные масла, атмосфера спокойствия и индивидуальный подход к каждому клиенту.',
  aboutTitle: 'О нашем салоне',
  aboutText: '«Мята & Эвкалипт» — это пространство, где забота о вашем теле становится искусством. Мы находимся в самом сердце Казани и предлагаем широкий спектр массажных услуг для восстановления энергии и здоровья.',
  servicesTitle: 'Наши услуги',
  reviewsTitle: 'Отзывы клиентов',
  contactsTitle: 'Контакты',
  address: 'Казань, ул. Чистопольская, 15',
  phone: '+7 (843) 123-45-67',
  email: 'info@myata-eucalypt.ru',
  workHours: 'Пн-Вс: 9:00 — 21:00',
  services: [
    {
      id: 1,
      title: 'Классический массаж',
      description: 'Расслабляющий массаж всего тела с использованием натуральных масел. Снимает напряжение и улучшает кровообращение.',
      price: '3 500 ₽',
      duration: '60 мин',
      icon: '🌿'
    },
    {
      id: 2,
      title: 'Спортивный массаж',
      description: 'Глубокая проработка мышц для восстановления после тренировок. Устраняет зажимы и повышает гибкость.',
      price: '4 200 ₽',
      duration: '60 мин',
      icon: '💪'
    },
    {
      id: 3,
      title: 'SPA-программа',
      description: 'Комплексный уход: ароматерапия, горячие камни, массаж лица и тела. Полная перезагрузка за 90 минут.',
      price: '5 800 ₽',
      duration: '90 минут',
      icon: '✨'
    }
  ],
  reviews: [
    { name: 'Алия М.', text: 'Потрясающий салон! После классического массажа чувствую себя заново рождённой. Мастера — настоящие профессионалы.', rating: 5 },
    { name: 'Рустам К.', text: 'Хожу на спортивный массаж уже полгода. Отличные результаты, мышцы восстанавливаются гораздо быстрее.', rating: 5 },
    { name: 'Елена В.', text: 'SPA-программа — это нечто! Атмосфера, ароматы, профессионализм. Рекомендую всем!', rating: 5 }
  ]
};

export default function App() {
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('salon_content');
    return saved ? JSON.parse(saved) : DEFAULT_CONTENT;
  });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [notification, setNotification] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Состояние формы бронирования
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleAdminLogin = () => {
    const password = prompt('Введите пароль для доступа к админ-панели:');
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      showNotification('Режим администратора активирован');
    } else if (password !== null) {
      showNotification('Доступ заблокирован. Неверный пароль.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    showNotification('Вы вышли из режима администратора');
  };

  const handleSaveChanges = () => {
    localStorage.setItem('salon_content', JSON.stringify(content));
    showNotification('Изменения сохранены успешно!');
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientPhone) {
      showNotification('Пожалуйста, заполните все поля записи');
      return;
    }
    showNotification(`Вы успешно записаны на ${selectedTime}! Ждём вас!`);
    setShowBooking(false);
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setClientPhone('');
  };

  const openBooking = (serviceName?: string) => {
    if (serviceName) setSelectedService(serviceName);
    setShowBooking(true);
    setMobileMenuOpen(false);
  };

  // Автогенерация следующих 7 дней для календаря записи
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
    };
  }), []);

  return (
    <div className="min-h-screen text-[#2F3E46] font-sans antialiased flex flex-col overflow-x-hidden bg-[#FDFBF7]">
      
      {/* Уведомления */}
      {notification && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[110] animate-slide-down">
          <div className="px-6 py-3 rounded-xl shadow-xl text-white font-medium bg-[#2D5A27] text-center sm:text-left">
            {notification}
          </div>
        </div>
      )}

      {/* Шапка сайта */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerScrolled ? 'bg-[#FDFBF7]/95 shadow-md backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-bold text-lg md:text-xl text-[#2D5A27] shrink-0">
            <span>🌿</span> Мята & Эвкалипт
          </a>
          
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <a href="#services" className="hover:text-[#87A96B] transition-colors">Услуги</a>
            <a href="#about" className="hover:text-[#87A96B] transition-colors">О нас</a>
            <a href="#reviews" className="hover:text-[#87A96B] transition-colors">Отзывы</a>
            <a href="#contacts" className="hover:text-[#87A96B] transition-colors">Контакты</a>
          </nav>

          <button onClick={() => openBooking()} className="hidden md:block bg-[#2D5A27] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#1E3F1A] transition-colors shrink-0">
            Онлайн-запись
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-2xl p-2 focus:outline-none" aria-label="Меню">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Мобильное навигационное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FDFBF7] shadow-xl px-6 pt-4 pb-8 flex flex-col gap-4 font-medium border-t border-gray-100 animate-slide-down">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 text-lg">Услуги</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 text-lg">О нас</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-gray-100 text-lg">Отзывы</a>
            <a href="#contacts" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-lg">Контакты</a>
            <button onClick={() => openBooking()} className="w-full bg-[#2D5A27] text-white py-3.5 rounded-xl font-bold text-center mt-2 shadow-md">
              Онлайн-запись
            </button>
          </div>
        )}
      </header>

      {/* Главный экран (Hero Section) */}
      <section className="pt-24 pb-12 md:pt-40 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-5 text-center md:text-left order-2 md:order-1">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D5A27] leading-tight ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => setContent({ ...content, heroTitle: e.target.innerText })}>
              {content.heroTitle}
            </h1>
            <p className={`text-base sm:text-lg text-[#2F3E46]/80 leading-relaxed ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
               contentEditable={isAdmin}
               suppressContentEditableWarning
               onBlur={(e) => setContent({ ...content, heroSubtitle: e.target.innerText })}>
              {content.heroSubtitle}
            </p>
            <div className="pt-2">
              <button onClick={() => openBooking()} className="w-full sm:w-auto bg-[#87A96B] hover:bg-[#6E8F55] text-white px-8 py-3.5 rounded-full font-bold text-base sm:text-lg transition-transform hover:-translate-y-0.5 shadow-lg">
                Выбрать массаж и записаться
              </button>
            </div>
          </div>
          <div className="order-1 md:order-2 px-2 sm:px-0">
            <div className="relative h-[240px] sm:h-[320px] md:h-[450px] bg-cover bg-center rounded-3xl shadow-xl overflow-hidden">
              <img 
                src="https://image.qwenlm.ai/generated-images/ba554cad-2907-478b-b829-91fd731cd832/_result.png" 
                alt="Массажный салон Мята & Эвкалипт" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D5A27]/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* О салоне */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D5A27] mb-6 ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => setContent({ ...content, aboutTitle: e.target.innerText })}>
              {content.aboutTitle}
            </h2>
            <p className={`text-base sm:text-lg text-[#2F3E46]/80 leading-relaxed ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
               contentEditable={isAdmin}
               suppressContentEditableWarning
               onBlur={(e) => setContent({ ...content, aboutText: e.target.innerText })}>
              {content.aboutText}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-[#FDFBF7] rounded-2xl p-6 text-center shadow-sm border border-[#87A96B]/10">
              <div className="text-4xl mb-3">🧘</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">7+ лет опыта</h3>
              <p className="text-sm text-[#2F3E46]/70">Наши мастера имеют сертификаты международного уровня</p>
            </div>
            <div className="bg-[#FDFBF7] rounded-2xl p-6 text-center shadow-sm border border-[#87A96B]/10">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">Натуральные масла</h3>
              <p className="text-sm text-[#2F3E46]/70">Используем только органическую косметику премиум-класса</p>
            </div>
            <div className="bg-[#FDFBF7] rounded-2xl p-6 text-center shadow-sm border border-[#87A96B]/10">
              <div className="text-4xl mb-3">💚</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">2000+ клиентов</h3>
              <p className="text-sm text-[#2F3E46]/70">Нам доверяют своё здоровье и красоту жители Казани</p>
            </div>
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section id="services" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D5A27] text-center mb-12 ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
              contentEditable={isAdmin}
              suppressContentEditableWarning
              onBlur={(e) => setContent({ ...content, servicesTitle: e.target.innerText })}>
            {content.servicesTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {content.services.map((service: { id: number; title: string; description: string; price: string; duration: string; icon: string }) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-[#2D5A27] mb-3">{service.title}</h3>
                <p className="text-[#2F3E46]/70 mb-4 leading-relaxed">{service.description}</p>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-bold text-[#2D5A27]">{service.price}</span>
                  <span className="text-sm text-[#2F3E46]/60 bg-[#87A96B]/10 px-3 py-1 rounded-full">{service.duration}</span>
                </div>
                <button 
                  onClick={() => openBooking(service.title)}
                  className="w-full bg-[#2D5A27] text-white py-3 rounded-xl font-semibold hover:bg-[#1E3F1A] transition-colors group-hover:shadow-md"
                >
                  Записаться
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section id="reviews" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D5A27] text-center mb-12 ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
              contentEditable={isAdmin}
              suppressContentEditableWarning
              onBlur={(e) => setContent({ ...content, reviewsTitle: e.target.innerText })}>
            {content.reviewsTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {content.reviews.map((review: { name: string; text: string; rating: number }, index: number) => (
              <div key={index} className="bg-[#FDFBF7] rounded-2xl p-6 md:p-8 border border-[#87A96B]/10">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-[#2F3E46]/80 leading-relaxed mb-4 italic">«{review.text}»</p>
                <p className="font-semibold text-[#2D5A27]">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="contacts" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D5A27] text-center mb-12 ${isAdmin ? 'border-2 border-dashed border-[#87A96B] p-2' : ''}`}
              contentEditable={isAdmin}
              suppressContentEditableWarning
              onBlur={(e) => setContent({ ...content, contactsTitle: e.target.innerText })}>
            {content.contactsTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">Адрес</h3>
              <p className="text-[#2F3E46]/70 text-sm">{content.address}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">Телефон</h3>
              <a href={`tel:${content.phone.replace(/\s/g, '')}`} className="text-[#2F3E46]/70 text-sm hover:text-[#2D5A27] transition-colors">{content.phone}</a>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">Email</h3>
              <a href={`mailto:${content.email}`} className="text-[#2F3E46]/70 text-sm hover:text-[#2D5A27] transition-colors">{content.email}</a>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🕐</div>
              <h3 className="font-bold text-[#2D5A27] mb-2">Режим работы</h3>
              <p className="text-[#2F3E46]/70 text-sm">{content.workHours}</p>
            </div>
          </div>
          {/* Карта-заглушка */}
          <div className="mt-10 rounded-2xl overflow-hidden shadow-md h-[300px] bg-gradient-to-br from-[#87A96B]/20 to-[#2D5A27]/10 flex items-center justify-center border border-gray-100">
            <div className="text-center">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="text-[#2D5A27] font-semibold text-lg">{content.address}</p>
              <p className="text-[#2F3E46]/60 text-sm mt-1">Рядом с метро «Суконная слобода»</p>
            </div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-[#2D5A27] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span>🌿</span> Мята & Эвкалипт
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <a href="#services" className="hover:text-white transition-colors">Услуги</a>
              <a href="#about" className="hover:text-white transition-colors">О нас</a>
              <a href="#reviews" className="hover:text-white transition-colors">Отзывы</a>
              <a href="#contacts" className="hover:text-white transition-colors">Контакты</a>
            </div>
            <div className="flex items-center gap-3">
              {!isAdmin ? (
                <button onClick={handleAdminLogin} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Админ
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveChanges} className="bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-2 rounded-full transition-colors">
                    💾 Сохранить
                  </button>
                  <button onClick={handleAdminLogout} className="bg-red-500/80 hover:bg-red-500 text-white text-xs px-4 py-2 rounded-full transition-colors">
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Социальные сети */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/50">Мы в социальных сетях:</p>
              <div className="flex items-center gap-3">
                <a href="https://instagram.com/myata_eucalypt" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all hover:scale-110 group">
                  <i className="fa-brands fa-instagram text-lg text-white/80 group-hover:text-white"></i>
                </a>
                <a href="https://t.me/myata_eucalypt" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all hover:scale-110 group">
                  <i className="fa-brands fa-telegram text-lg text-white/80 group-hover:text-white"></i>
                </a>
                <a href="https://wa.me/78431234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all hover:scale-110 group">
                  <i className="fa-brands fa-whatsapp text-lg text-white/80 group-hover:text-white"></i>
                </a>
                <a href="https://vk.com/myata_eucalypt" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all hover:scale-110 group">
                  <i className="fa-brands fa-vk text-lg text-white/80 group-hover:text-white"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Мята & Эвкалипт. Все права защищены.
          </div>
        </div>
      </footer>

      {/* Модальное окно бронирования */}
      {showBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBooking(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#2D5A27]">Онлайн-запись</h3>
                <button onClick={() => setShowBooking(false)} className="text-2xl text-gray-400 hover:text-gray-600 transition-colors p-1">✕</button>
              </div>

              {/* Выбор услуги */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#2F3E46] mb-2">Выберите услугу</label>
                <select 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[#2F3E46] focus:outline-none focus:ring-2 focus:ring-[#87A96B] focus:border-transparent bg-[#FDFBF7]"
                >
                  <option value="">— Выберите —</option>
                  {content.services.map((s: { id: number; title: string; price: string }) => (
                    <option key={s.id} value={s.title}>{s.title} — {s.price}</option>
                  ))}
                </select>
              </div>

              {/* Выбор даты */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#2F3E46] mb-2">Выберите дату</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-medium transition-all text-center ${
                        selectedDate === date.value
                          ? 'bg-[#2D5A27] text-white shadow-md'
                          : 'bg-[#FDFBF7] text-[#2F3E46] hover:bg-[#87A96B]/20 border border-gray-100'
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Выбор времени */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#2F3E46] mb-2">Выберите время</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((time, index) => (
                    <button
                      key={time}
                      onClick={() => SLOT_AVAILABILITY[index] && setSelectedTime(time)}
                      disabled={!SLOT_AVAILABILITY[index]}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        !SLOT_AVAILABILITY[index]
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : selectedTime === time
                          ? 'bg-[#2D5A27] text-white shadow-md'
                          : 'bg-[#FDFBF7] text-[#2F3E46] hover:bg-[#87A96B]/20 border border-gray-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Телефон */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#2F3E46] mb-2">Ваш телефон</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[#2F3E46] focus:outline-none focus:ring-2 focus:ring-[#87A96B] focus:border-transparent bg-[#FDFBF7] placeholder:text-gray-400"
                />
              </div>

              {/* Кнопка записи */}
              <button
                onClick={handleBooking}
                className="w-full bg-[#2D5A27] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1E3F1A] transition-colors shadow-lg"
              >
                Записаться
              </button>
              <p className="text-xs text-[#2F3E46]/50 text-center mt-3">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
