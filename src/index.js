import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { List, Container, Search, Menu, Divider, Image } from 'semantic-ui-react';
import { recipes } from './recipes';
import 'semantic-ui-css/semantic.min.css';
import _ from 'lodash';

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
        <img key={i} src='./olive-black-1.png' width={props.width} alt={i}/>
      ))}
      {_.times(5-props.rating, i => (
        <img key={i} src='./olive-white-1.png' width={props.width} alt=''/>
      ))}      
    </span>
  )
}

function RecipeDetails(props) {
  return (
    <div>
      <div className="recipe-details">
        <div className="name">
          <h2>{props.recipe.name}</h2>
          <OliveRating rating={props.recipe.rating} width="25"/>
        </div>
      
        <Divider />

        {props.recipe.components.sort((c0, c1) => c0.index > c1.index).map((c) =>        
          <div key={c.index} className="component">
            <span className="quantity">{fancy_quantity(c.quantity)} </span>
            <span className="unit">{c.unit} </span>
            <span className="ingredient">{c.ingredient}</span>
          </div>
        )}        
        <Divider />
        <div className="text">
          {props.recipe.text}
        </div>
      </div>
    </div>
  );
}

function RecipeList(props) {  
  let recipes = props.recipes.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
                             .filter((recipe) => recipe.name.toLowerCase().includes(props.filterText.toLowerCase()))
  
  return (
    <List divided relaxed>
      {recipes.map(recipe =>
        <List.Item as='a' key={recipe.name} onClick={() => props.onRecipeSelected(recipe)}>
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
  )
}

class FilteredRecipeList extends React.Component {
  state = {filterText: ''}

  handleFilterTextChange = (e, { value }) => this.setState({filterText: value})

  render() {
    return (
      <div>
        <Search input={{ fluid: true }} size={'mini'} open={false} onSearchChange={this.handleFilterTextChange} />
        <RecipeList recipes={this.props.recipes} filterText={this.state.filterText} onRecipeSelected={this.props.onRecipeSelected} />
      </div>
    )
  }
}

function IngredientList(props) {
  return (
    <List divided relaxed>
      {Array.from(props.ingredients).sort((a, b) => a[0].localeCompare(b[0])).map(([ingredient, recipes]) => {
        return (
          <List.Item as='a' key={ingredient} onClick={() => props.onIngredientSelected(ingredient, recipes)}>
            <List.Content>
              <List.Header>{ingredient}</List.Header>
              <List.Description>{recipes.map(r => r.name).sort().join(', ')}</List.Description>
            </List.Content>
          </List.Item>
        )
      })}
    </List>
  )
}

class App extends React.Component {
  state = {
    ingredient: null,
    recipes: null,
    selectedRecipe: null,
    ingredientView: false,
  }

  handleRecipes = (e, d) => {
    this.setState({
      ingredient: null,
      recipes: null,
      selectedRecipe: null,
      ingredientView: false,
    });
  }

  handleIngredients = (e, d) => this.setState({ingredientView: true})

  handleRecipeSelected = (selectedRecipe) => this.setState({selectedRecipe: selectedRecipe})

  handleIngredientSelected = (ingredient, recipes) => {
    this.setState({
      ingredient: ingredient,
      recipes: recipes,
      selectedRecipe: null,
      ingredientView: false,
    })
  }

  render() {
    var view;

    if (this.state.ingredientView) {
      view = <IngredientList ingredients={this.props.ingredients} onIngredientSelected={this.handleIngredientSelected} />
    } else if (this.state.selectedRecipe) {
      view = <RecipeDetails recipe={this.state.selectedRecipe} />
    } else {
      view = <FilteredRecipeList recipes={this.state.recipes || this.props.recipes} ingredient={this.state.ingredient} onRecipeSelected={this.handleRecipeSelected} />
    }

    return (
      <Container>
        <Menu borderless={true} fluid widths={2}>
          <Menu.Item name='Recipes' active={!this.state.ingredientView} onClick={this.handleRecipes}>
            <Image src='./Martini-outline-Small@2x.png' width='25'/>
            &nbsp;Recipes
          </Menu.Item>
          <Menu.Item name='Ingredients' active={this.state.ingredientView} onClick={this.handleIngredients}>
            <Image src='./Bottles-label-Small@2x.png' width='25'/>
            &nbsp;&nbsp;Ingredients
          </Menu.Item>
        </Menu>      
        {view}
      </Container>
    )
  }
}

// <MenuBar onRecipes={this.handleRecipes} onIngredients={this.handleIngredients} />

// ========================================
function gitrdone(recipes) {
  var ingredients = new Map();

  recipes.map((recipe) =>
    recipe.components.map((component) => {
      var ingredient_recipes = ingredients.get(component.ingredient) || [];
      ingredient_recipes.push(recipe);
      ingredients.set(component.ingredient, ingredient_recipes);
      return null;
    })
  )

  ReactDOM.render(<App recipes={recipes} ingredients={ingredients} />, document.getElementById('root'));
}

// let url = 'https://raw.githubusercontent.com/mikepartelow/sozzler-recipes/master/SozzlerApp/1.0.sozzler';
// fetch(url)
//   .then((res) => res.json())
//   .then((recipes) => {
//     gitrdone(recipes)
// })

gitrdone(recipes)