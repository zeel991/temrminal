import ContractWrite from '@/components/ContractWrite'
import WalletConnect from '../components/WalletConnect'
import Balance from '@/components/Balance'
import SendTransaction from '@/components/SendTransaction'
import SwitchNetwork from '@/components/SwitchNetwork'
import Token from '@/components/Token'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to My Wallet App
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect your wallet to access Web3 features
          </p>
          
          <div> <Token /></div>
          <Balance />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600 text-sm">
                Your wallet connection is secure and private
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Easy</h3>
              <p className="text-gray-600 text-sm">
                Connect with just one click using Privy
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Fast</h3>
              <p className="text-gray-600 text-sm">
                Quick and seamless wallet integration
              </p>
            </div>
          </div>

          <div>
            {/* <SendTransaction /> */}
            <ContractWrite />
          </div>
        </div>
      </div>
    </main>
  )
}