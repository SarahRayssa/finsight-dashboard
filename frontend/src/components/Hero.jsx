export default function Hero() {
  return (
    <section className="h-[80vh] flex flex-col justify-center items-center text-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Bem-vindo ao FinSigth
      </h1>
      <p className="text-lg text-gray-600 max-w-xl mb-6">
        Plataforma inteligente para análise financeira e previsão estratégica.  
      </p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Começar agora
      </button>
    </section>
  );
}
