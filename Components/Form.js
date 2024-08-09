import {useEffect, useReducer, useState} from 'react';
import useConfigFormState from '../Hooks/useConfigFormState';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import Label from './Label';
import Input from './Input';
import style from '../AppStyling';
import Button from './Button';
import logoImg from '../Assets/logo.png';
import LinearGradient from 'react-native-linear-gradient';
import groupPic from '../Assets/groupPic.png';
import profilePic from '../Assets/contact-icon-empty.png';
import Icon from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';

function reducer(state, action) {
  if (action.type === 'RESET') {
    const resetedState = Object.entries(state).reduce((prev, curr) => {
      return {...prev, [curr[0]]: ''};
    }, {});
    return resetedState;
  } else return {...state, [action.type]: action.payload};
}

/* 
 Each config is used to show a form, in config you must include data only,handling logic and
 viewing the date is done at this component and it's parent
*/

function Form({
  config,
  responseError,
  submitButtonStyle,
  onSubmimsubmitButtonText,
  submitButtonTextStyle,
  onSubmit,
  isLoading,
  children,
  noValidationBeforeSubmit,
  formStyle,
  bottomChildren,
}) {
  ///////////////////// CONFIGS //////////////////////////////////

  //Initilizing states of the form in  the reducer
  const route = useRoute();
  const [state, dispatch] = useReducer(reducer, useConfigFormState(config));

  /////////////////////// USESELECTERS ///////////////////////////

  ///////////////////////////// STATES //////////////////////////////
  const [isLoadingState, setIsLoadingState] = useState(isLoading);
  //Handles Validation Errors
  const [validationErrors, setValidationErrors] = useState('');

  //Handle response error in form component
  const [formResErrorState, setFormResErrorState] = useState(responseError);
  ////////////////////////// APIS ///////////////////////////////////

  //////////////////////// USEEFFECTS ////////////////////////////////
  useEffect(() => {
    setFormResErrorState(responseError);
    if (responseError === '' || responseError === 'SUCCESS') {
      dispatch({type: 'RESET', payload: ''});
    }
  }, [responseError]);

  useEffect(() => {
    setIsLoadingState(isLoading);
  }, [isLoading]);
  ////////////////////// HOOKS  //////////////////////
  //Changes the state adepending on the value
  function validateBeforeSubmit() {
    const validationBeforeSubmit = config.reduce(
      (prev, configElement, index) => {
        let validationErrorBeforSubmit = '';

        if (configElement.state === 'cpassword')
          validationErrorBeforSubmit = configElement.validator(
            configElement.state,
            state[configElement.state],
            state['password'],
          );
        else
          validationErrorBeforSubmit = configElement.validator(
            configElement.state,
            state[configElement.state],
          );
        if (validationErrorBeforSubmit !== '') {
          if (index === 0) return prev + validationErrorBeforSubmit;
          else return prev + ',' + validationErrorBeforSubmit;
        } else return prev;
      },
      '',
    );
    if (noValidationBeforeSubmit) {
      onSubmit(state);
      return;
    }
    if (
      formResErrorState === '' &&
      validationErrors === '' &&
      validationBeforeSubmit === ''
    )
      onSubmit(state);
    else setValidationErrors(validationBeforeSubmit);
  }

  function onFeildChange(stateName, value, validator) {
    // //console.log(state);
    let validationError;
    if (stateName === 'cpassword')
      validationError = validator(stateName, value, state['password']);
    else validationError = validator(stateName, value);

    //Check validation violation
    if (formResErrorState !== '') setFormResErrorState('');

    if (validationError !== '') {
      setValidationErrors(validationError);
    } else {
      setValidationErrors('');
    }

    dispatch({type: stateName, payload: value});
  }
  ////////////////////// RETURNED COMPONENTS //////////////////////
  // <LinearGradient colors={['#06788D', '#06818D', '#00A2A2']}>
  return (
    <View style={{height: '100%'}}>
      {children}

      <View
        style={{
          height: '100%',
          width: '100%',
          alignItems: 'center',
          // alignSelf: 'center',
          // justifyContent: 'center',
        }}>
        {/**SHOW LOGO ONLY IN LOGIN , SIGNUP AND WELCOME PAGES */}
        {route.name === 'Login' ||
        route.name === 'Signup' ||
        route.name === 'Welcome' ? (
          <Image
            source={logoImg}
            style={[style.logoImgStyle, {marginBottom: '5%', marginTop: '20%'}]}
          />
        ) : (
          false
        )}

        <View style={{width: '80%'}}>
          {config.map(configElement => {
            return (
              <View key={configElement.lable}>
                <Label text={configElement.lable} style={style.labelForm} />

                <Input
                  value={state[configElement.state]}
                  onChange={text => {
                    onFeildChange(
                      configElement.state,
                      text,
                      configElement.validator,
                    );
                  }}
                  style={style.inputForm}
                  placeHolder={configElement.placeHolder}
                  isPassword={configElement?.isPassword}
                />
              </View>
            );
          })}
        </View>

        <View>
          <Text style={{color: 'white', fontSize: 12}}>{validationErrors}</Text>
          <Text style={{color: 'white', fontSize: 12}}>
            {formResErrorState !== 'SUCCESS' && formResErrorState}
          </Text>
        </View>

        <View style={{width: '50%'}}>
          <Button
            onPress={validateBeforeSubmit}
            text={onSubmimsubmitButtonText}
            styleText={[submitButtonTextStyle, {padding: '0%'}]}
            styleButton={[submitButtonStyle, {padding: '2%', borderRadius: 7}]}
          />

          {isLoadingState ? (
            <ActivityIndicator
              size="large"
              color="#058095"
              style={{height: '100%'}}
            />
          ) : (
            ''
          )}
        </View>
        {bottomChildren}
      </View>
    </View>
  );
}
export default Form;
{
  /* </LinearGradient> */
}
