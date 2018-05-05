import React from 'react'
import ReactDOM from 'react-dom'
import slug from 'slug'
import './index.css'
import { List, Container, Search, Menu, Divider, Image, Segment } from 'semantic-ui-react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

import {Helmet} from "react-helmet"
import { recipes } from './recipes'
import 'semantic-ui-css/semantic.min.css'
import _ from 'lodash'

function fancy_quantity(quantity) {
  let [qn, qd] = quantity.split('/')

  if (qn === '0') {
    quantity = ''
  } else if (qd === '1') {
    quantity = qn
  } else {
    let [ qni, qdi ] = [ parseInt(qn, 10), parseInt(qd, 10) ]
    if (qni > qdi) {
      quantity = `${Math.floor(qni/qdi)} ${qni%qdi}/${qdi}`
    }
  }

  return quantity
}

function OliveRating(props) {
  return (
    <span>
      {_.times(props.rating, i => (
        <Image inline key={i} src='/sozzler/olive-black-1.png' width={props.width} alt={i}/>
      ))}
      {_.times(5-props.rating, i => (
        <Image inline key={i} src='/sozzler/olive-white-1.png' width={props.width} alt=''/>
      ))}
    </span>
  )
}

const Recipe = (props) => (
  <Segment>
    <Helmet>
      <title>Sozzler: {props.recipe.name}</title>
    </Helmet>

    <Container>
      <h2>{props.recipe.name}</h2>
      <OliveRating rating={props.recipe.rating} width="25"/>
    </Container>

    <Divider />

    {props.recipe.components.sort((c0, c1) => c0.index > c1.index).map((c) =>
      <Container key={c.index} className="component">
        <span className="quantity">{fancy_quantity(c.quantity)} </span>
        <span className="unit">{c.unit} </span>
        <span className="ingredient">{c.ingredient}</span>
      </Container>
    )}
    <Divider />
    <Container className="text">
      {props.recipe.text}
    </Container>
  </Segment>
)

const iincludes = (a, b) => a.toLowerCase().includes(b.toLowerCase())
const hasingredient = (r, i) => i ? r.components.some(c => c.ingredient.toLowerCase() === i) : true

class Recipes extends React.Component {
  state = { filterText: '', }
  handleFilterTextChange = (e, { value }) => this.setState({filterText: value})

  render() {
    let ingredient = decodeURIComponent(this.props.location.search.slice(3).toLowerCase())

    return (
      <Container>
        <Search input={{ fluid: true }} size={'mini'} open={false} onSearchChange={this.handleFilterTextChange} />
        <List divided relaxed>
          {this.props.recipes.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
                        .filter((recipe) => iincludes(recipe.name, this.state.filterText))
                        .filter(recipe => hasingredient(recipe, ingredient))
                        .map((recipe) =>
            <List.Item as={Link} to={`/recipes/${recipe.slug}`} key={recipe.slug}>
                <List.Content>
                  <List.Header as='h3'>{recipe.name}</List.Header>
                  <List.Header><OliveRating rating={recipe.rating} width="15"/></List.Header>
                  <List.Description>
                    {recipe.components.sort((c0, c1) => c0.index > c1.index).map(c => c.ingredient).join(', ')}
                  </List.Description>
                </List.Content>
              </List.Item>
          )}
        </List>
      </Container>
    )
  }
}

const Ingredients = (props) => (
  <Container>
    <Helmet>
      <title>Sozzler: Ingredients</title>
    </Helmet>

    <List divided relaxed>
      {Array.from(props.ingredients).sort((a, b) => a[0].localeCompare(b[0])).map(([ingredient, recipes]) => {
        return (
          <List.Item as={Link} to={`/recipes/?i=${ingredient}`} key={ingredient}>
            <List.Content>
              <List.Header>{ingredient}</List.Header>
              <List.Description>{recipes.map(r => r.name).sort().join(', ')}</List.Description>
            </List.Content>
          </List.Item>
        )
      })}
    </List>
  </Container>
)

const Sozzler = (props) => (
  <Router>
    <Container>
      <Menu borderless={true} fluid widths={2}>
        <Menu.Item name='Recipes' as={Link} to='/recipes' onClick={this.handleRecipes}>
          <Image src='./Martini-outline-Small@2x.png' width='25'/>
          &nbsp;Recipes
        </Menu.Item>
        <Menu.Item name='Ingredients' as={Link} to='/ingredients' onClick={this.handleIngredients}>
          <Image src='/sozzler/Bottles-label-Small@2x.png' width='25'/>
          &nbsp;&nbsp;Ingredients
        </Menu.Item>
      </Menu>

      <Route path='/recipes/:slug' render={(rprops) => (
        <Recipe recipe ={props.recipes.find((r) => r.slug === rprops.match.params.slug)}/>
      )}/>
      <Route exact path="/recipes" render={(rprops) => <Recipes {...rprops} recipes={props.recipes}/>}/>
      <Route path="/ingredients" render={(rprops) => <Ingredients {...rprops} ingredients={props.ingredients}/>}/>
    </Container>
  </Router>
)

// TODO: restore 'active' on menu.item
// TODO: Helmet: Sozzler: Recipes

function gitrdone(recipes) {
  var ingredients = new Map()

  recipes = recipes.map((recipe) => {
    recipe.components.map((component) => {
      var ingredient_recipes = ingredients.get(component.ingredient) || []
      ingredient_recipes.push(recipe)
      ingredients.set(component.ingredient, ingredient_recipes)
      return null
    })

    recipe.slug = slug(recipe.name)
    return recipe
  })

  ReactDOM.render(<Sozzler recipes={recipes} ingredients={ingredients} />, document.getElementById('root'));
}

gitrdone(recipes)
