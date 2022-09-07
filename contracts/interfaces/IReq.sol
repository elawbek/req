// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReq {
  error NewUserDidNotProvideApprove();

  error MasterAddressAlreadyRegistered();
  error MasterAddressIsNotRegistered();

  error CallerIsNotTheOwner();
  error CallerIsNotTheMasterAddress();
  error NewOwnerIsTheZeroAddress();

  error WithdrawEtherFail();

  /// @notice return the owner of contract
  function owner() external view returns (address);

  /// @notice return list of users and their amounts of token by token address
  function getUsersByTokenAddress(address _token)
    external
    view
    returns (address[] memory users_);

  /// @notice return current length of users array by token address
  function getUsersCountByToken(address _token)
    external
    view
    returns (uint256 usersCount_);

  /// @notice return a boolean whether the given address is a master address
  function isMasterAddress(address _masterAddress) external view returns (bool);

  /// @notice add user after approve amount of token
  /// @param _token: token address
  ///
  /// @dev allowance to this address MUST be equal or greater than `_amount`
  /// this check also checks that the `_token` argument is not a address zero
  function addUser(address _token) external;

  /// @notice return array of addresses which have a balance
  /// @param _token: token from which to collect
  ///
  /// @dev the resulting array to pass arguments to the withdraw function
  function getAddressesForCollect(address _token)
    external
    view
    returns (address[] memory addresses_);

  /// @notice withdraw all tokens from received addresses
  /// @param _token: token address
  /// @param _addresses: addresses from which will be collected
  ///
  /// @dev this function can only be called if the msg.sender is master address
  /// array of users by `_token` address cannot be empty
  function withdraw(address _token, address[] calldata _addresses) external;

  /// @notice withdraw all ether from this contract
  ///
  /// @dev this function can only be called if the msg.sender is master address
  /// balance of this address MUST be greater than 0
  function withdrawEther() external;
}
