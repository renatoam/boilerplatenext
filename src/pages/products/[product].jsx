import PropTypes from 'prop-types'
import { useState } from 'react';
import Image from '../../components/Media/Image'
import Container from '../../components/Foundation/Container';
import ControlButton from '../../components/Foundation/ControlButton'
import axiosInstance from '../../services/axios'
import { FALLBACK_IMAGEBIG } from '../../constants/global'
import { useCart } from '../../context/cart'
import { convertToCurrency } from '../../helpers/handleString'
import { StyledSection } from '../../styles/pages/details'

// PARECE QUE SÓ CONSIGO TESTAR ESSAS COISAS RODANDO O BUILD
// MAS O BUILD TÁ DANDO ERRO, VERIFICAR

export async function getStaticPaths() {
  const axios = axiosInstance('backend')
  const products = await axios.get('/').then(response => response.data.products)
  const filteredProducts = products.filter(product => product.brand === 'Samsung')
  const productsPaths = filteredProducts.map(product => `/products/${product.id}`)

  return {
    paths: productsPaths,
    fallback: 'blocking'
  }
}

export async function getStaticProps(context) {
  const id = context.params.product
  const axios = axiosInstance('backend')
  const products = await axios.get('/').then(response => response.data.products)
  const currentProduct = products.find(product => product.id.toString() === id)

  return {
    props: {
      currentProduct
    }
  }
}

export default function ProductDetails({ currentProduct }) {
  const { dispatch } = useCart()
  const [value, setValue] = useState(0)
  const [error, setError] = useState('')
  const customStyle = {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '20px 0'
  }

  function handleDispatchAction(action) {
    const newValue = action === 'ADD' ? value + 1 : value - 1
    dispatch({ type: action, payload: currentProduct })
    setValue(newValue)
  }

  function handleValueByInput(value) {
    dispatch({
      type: 'CHANGE',
      payload: {
        ...currentProduct,
        newQuantity: value
      }
    })
    setValue(value)
  }

  function handleAddingItems(idAction) {
    const action = idAction.toUpperCase()

    if (currentProduct.stock === 0) {
      setError('Estoque zerado')
      return
    }

    handleDispatchAction(action)
  }

  function handleRemovingItems(idAction) {
    const action = idAction.toUpperCase()

    if (currentProduct.currentQuantity === 0) return

    handleDispatchAction(action)
  }

  if (!currentProduct) return <p>Loading...</p>

  return (
    <Container>
      <StyledSection className="wrapper">
        <StyledSection className="image">
          <Image src={FALLBACK_IMAGEBIG} width={500} height={500} fallback={FALLBACK_IMAGEBIG} />
        </StyledSection>
        <StyledSection className="info">
          <div>
            <h2>{currentProduct.title}</h2>
            <small>{currentProduct.id}</small>
          </div>
          <div style={customStyle}>
            <p>{convertToCurrency(currentProduct.price)}</p>
            <ControlButton
              value={value}
              error={error}
              handleAddingItems={handleAddingItems}
              handleRemovingItems={handleRemovingItems}
              handleChange={handleValueByInput}
              />
          </div>
        </StyledSection>
        <StyledSection className="description">
          <p>{currentProduct.description}</p>
        </StyledSection>
      </StyledSection>
    </Container>
  )
}

ProductDetails.propTypes = {
  currentProduct: PropTypes.object
}
