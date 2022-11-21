import { GetServerSideProps, GetStaticProps } from "next"
import Stripe from "stripe"
import { stripe } from "../../lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product"
import Image from 'next/legacy/image'
import { useRouter } from "next/router"
import axios from "axios"
import { useState } from "react"
import Head from "next/head"

interface ProductPropos{
  product: {
    id: string;
    name: string;
    price: string;
    description: string;
    imageUrl: string;
    defaultPriceId: string;
  }
}

export default function Product({product}: ProductPropos) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  async function handleBuyProduct() {
    setIsCreatingCheckoutSession(true);

    try {
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;
    } catch(err) {
      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout');
    }
  }

  return(
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer >
        <ImageContainer>
          <Image src={product.imageUrl} alt='' width={520} height={480}/>
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>    
    </>

  )
}

export const getStaticPaths = async () => {

  return{
    paths: [
      {params: {id: 'prod_MoMvZk28UEEiCT'}}
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, {id: string}> = async ({ params }) => {
  const productId = params!.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product:{
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        description: product.description,
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount! / 100),
        defaultPriceId: price.id, 
      },

    },  
    // revalidate: 60 * 60 * 1, //1 hora 

  }
} 