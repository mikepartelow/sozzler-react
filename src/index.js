import React from 'react';
import ReactDOM from 'react-dom';
// import {Helmet} from "react-helmet";
import './index.css';
import { List, Container, Search, Menu, Divider } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

function Helmet(props) {
  return ''
}

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

function RecipeDetails(props) {
  return (
    <div>
      <Helmet>
        <title>{props.recipe.name}</title>
      </Helmet>

      <div className="recipe-details">
        <div className="name">
          <h3>{props.recipe.name} : {props.recipe.rating}</h3>
        </div>
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
  
  // <Helmet><title>{this.props.ingredient ? "Recipes With " + this.props.ingredient : "Recipes"}</title></Helmet>
    
  return (
    <List divided relaxed>
      {recipes.map(recipe =>
        <List.Item key={recipe.name} onClick={() => props.onRecipeSelected(recipe)}>
            <List.Content>
              <List.Header>{recipe.name} : {recipe.rating}</List.Header>
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
      {Array.from(props.ingredients).map(([ingredient, recipes]) => {
        return (
          <List.Item key={ingredient} onClick={() => props.onIngredientSelected(ingredient, recipes)}>
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
        <Menu items={[
          { key: 'recipes', name: 'Recipes', active: !this.state.ingredientView, onClick: this.handleRecipes },
          { key: 'ingredients', name: 'Ingredients', active: this.state.ingredientView, onClick: this.handleIngredients}
        ]} />      
        {view}
      </Container>
    )
  }
}

// <MenuBar onRecipes={this.handleRecipes} onIngredients={this.handleIngredients} />

// ========================================
let url = 'https://raw.githubusercontent.com/mikepartelow/sozzler-recipes/master/SozzlerApp/1.0.sozzler';
fetch(url)
  .then((res) => res.json())
  .then((recipes) => {
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
})