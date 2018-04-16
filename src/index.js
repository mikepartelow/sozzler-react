import React from 'react';
import ReactDOM from 'react-dom';
import {Helmet} from "react-helmet";
import './index.css';

function RecipeDetails(props) {
  return (
    <div>
      <Helmet>
        <title>{props.recipe.name}</title>
      </Helmet>

      <div className="recipe-details">
        <div className="name">
          {props.recipe.name} : {props.recipe.rating}
        </div>
        <hr />
        <div className="text">
          {props.recipe.text}
        </div>
      </div>
    </div>
  );
}

class Recipe extends React.Component {
  render() {
    const ingredients = this.props.recipe.components.sort((c0, c1) => c0.index > c1.index).map((component) =>
        component.ingredient
    ).join(', ');

    return (
      <li className="recipe" onClick={() => this.props.onRecipeSelected(this.props.recipe)}>
        <div className="name">
          {this.props.recipe.name} : {this.props.recipe.rating}
        </div>
        <div className="ingredients">
          {ingredients}
        </div>
      </li>
    );
  }
}

class RecipeList extends React.Component {  
  render() {
    return (
      <div>
        <Helmet><title>Recipes</title></Helmet>
        <ul className="recipes">
          {this.props.recipes.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
                             .filter((recipe) => recipe.name.toLowerCase().includes(this.props.filterText.toLowerCase()))
                             .map((recipe) => <Recipe key={recipe.name} recipe={recipe} onRecipeSelected={this.props.onRecipeSelected} />)
          }
        </ul>
      </div>
    );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
  }
  
  handleFilterTextChange(e) {
    this.props.onFilterTextChange(e.target.value);
  }
  
  render() {
    return (
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={this.props.filterText}
          onChange={this.handleFilterTextChange}
        />
      </form>
    );
  }
}

class FilteredRecipeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
    };
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
  }

  handleFilterTextChange(filterText) {
    this.setState({
      filterText: filterText
    });
  }

  render() {
    return (
      <div>
        <SearchBar filterText={this.state.filterText} onFilterTextChange={this.handleFilterTextChange} />
        <RecipeList recipes={this.props.recipes} filterText={this.state.filterText} onRecipeSelected={this.props.onRecipeSelected} />
      </div>
    )
  }
}

class Ingredient extends React.Component {
  render() {
    return (
      <li className="ingredient">
        <div className="name">
          {this.props.ingredient}
        </div>
        <div className="recipes">
          this recipe, that recipe, other recipe
        </div>
      </li>
    );
  }
}

class IngredientList extends React.Component {
  render() {
    return (
      <div>
        <Helmet><title>Ingredients</title></Helmet>
        <ul className="ingredients">
          {this.props.ingredients.sort((a, b) => a.localeCompare(b))
                                 .map((ingredient) => <Ingredient key={ingredient} ingredient={ingredient} />)
          }
        </ul>
      </div>
    )
  }
}


class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleRecipes = this.handleRecipes.bind(this);
    this.handleIngredients = this.handleIngredients.bind(this);
  }

  handleRecipes() {
    this.props.onRecipes()
  }

  handleIngredients() {  
    this.props.onIngredients()  
  }

  render() {
    return (
      <div>
        <button onClick={this.handleRecipes}>Recipes</button> |
        <button onClick={this.handleIngredients}>Ingredients</button>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRecipe: null,
      ingredientView: false,
    };
    this.handleRecipeSelected = this.handleRecipeSelected.bind(this);
    this.handleRecipes = this.handleRecipes.bind(this);
    this.handleIngredients = this.handleIngredients.bind(this);
  }

  handleRecipes() {
    this.setState({
      selectedRecipe: null,
      ingredientView: false,
    });
  }

  handleIngredients() {
    this.setState({
      ingredientView: true,
    });
  }

  handleRecipeSelected(selectedRecipe) {
    this.setState({
      selectedRecipe: selectedRecipe
    });
  }

  render() {
    return (
      <div>
        <MenuBar onRecipes={this.handleRecipes} onIngredients={this.handleIngredients} />
        {this.state.ingredientView ? <IngredientList ingredients={this.props.ingredients} />
                                   : this.state.selectedRecipe ? <RecipeDetails recipe={this.state.selectedRecipe} /> :
                                                                 <FilteredRecipeList recipes={this.props.recipes} onRecipeSelected={this.handleRecipeSelected} />}
      </div>
    )
  }
}

// ========================================
let url = 'https://raw.githubusercontent.com/mikepartelow/sozzler-recipes/master/SozzlerApp/1.0.sozzler';
fetch(url)
  .then((res) => res.json())
  .then((recipes) => {
    var ingredients = new Set();
    
    recipes.map((recipe) =>
      recipe.components.map((component) =>
        ingredients.add(component.ingredient)
      )
    )

    ReactDOM.render(<App recipes={recipes} ingredients={Array.from(ingredients)} />, document.getElementById('root'));
})