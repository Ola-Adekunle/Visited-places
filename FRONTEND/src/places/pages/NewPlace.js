import React from "react";

import Input from "../../shared/components/FormElements/Input";
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../../shared/util/Validators";
import Button from '../../shared/components/FormElements/Button';
import { useForm } from '../../shared/hooks/form-hook'

import './PlaceForm.css';



const NewPlace = () => {
    const [formState, inputHandler] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        },
        address: {
            value: '',
            isValid: false
        }
    }, false);

    const placeSubmitHandler = event => {
        event.preventDefault();
        console.log(formState.inputs); //Send this to the backend.
    }

    return <form className="place-form" onSubmit={placeSubmitHandler}>
        <Input 
        id= 'title'
        element='input' 
        type="text" 
        label="Title" 
        validators={[VALIDATOR_REQUIRE()]} 
        errorText='Please enter a valid Title.'
        onInput={inputHandler}
        />
        <Input 
            id= 'description'
            element='textarea' 
            type="text" 
            label="description" 
            validators={[VALIDATOR_MINLENGTH(5)]} 
            errorText='Please enter a valid description (at least 5 characters).'
            onInput={inputHandler}
        />
        <Input 
            id= 'address'
            element='input' 
            type="text" 
            label="Address" 
            validators={[VALIDATOR_REQUIRE()]} 
            errorText='Please enter a valid Address.'
            onInput={inputHandler}
        />
        <Button type='submit' disabled={!formState.isValid}>ADD PLACE</Button>
    </form>;
};

export default NewPlace;