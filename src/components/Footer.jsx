function Footer() {
    return (
        <footer className="fixed bottom-0 right-0 left-0 z-10 h-[48px] border-t border-gray-200 bg-white shadow-sm">
            <div className="mx-auto h-full max-w-7xl px-4">
                <div className="flex h-full flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center transition-colors hover:text-gray-900">
                        <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">Công ty CP Chiếu sáng và Kiểm định XD Hưng Long</span>
                    </div>
                    <div className="flex items-center transition-colors hover:text-gray-900">
                        <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>P3-C18 Tập thể Voi phục ĐH GTVT, P. Ngọc Khánh, Q. Ba Đình, Tp Hà Nội</span>
                    </div>
                    <div className="flex items-center transition-colors hover:text-gray-900">
                        <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="font-medium">0912.572.327</span>
                    </div>
                    <div className="flex items-center transition-colors hover:text-gray-900">
                        <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">info@hl-traffic.com</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 